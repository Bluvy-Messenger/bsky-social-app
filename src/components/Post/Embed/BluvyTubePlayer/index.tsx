import {useCallback, useEffect, useMemo, useState} from 'react'
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native'
import Animated, {
  measure,
  useAnimatedRef,
  useFrameCallback,
} from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {WebView} from 'react-native-webview'
import {scheduleOnRN} from 'react-native-worklets'
import {Image} from 'expo-image'
import {useLingui} from '@lingui/react/macro'
import {useNavigation} from '@react-navigation/native'

import {type NavigationProp} from '#/lib/routes/types'
import {EventStopper} from '#/view/com/util/EventStopper'
import {atoms as a, useTheme} from '#/alf'
import {Fill} from '#/components/Fill'
import {KeepAwake} from '#/components/KeepAwake'
import {PlayButtonIcon} from '#/components/video/PlayButtonIcon'
import {IS_NATIVE} from '#/env'
import {type app} from '#/lexicons'

export function getBluvyTubeEmbedUri(
  embed: app.bsky.embed.video.View,
  post?: app.bsky.feed.defs.PostView,
  locale?: string,
): string {
  const langParam = locale ? `&lang=${encodeURIComponent(locale)}` : ''
  if (post?.uri) {
    const match = post.uri.match(
      /^at:\/\/([^/]+)\/app\.bsky\.feed\.post\/([^/]+)$/,
    )
    if (match) {
      return `https://tube.bluvy.app/embed/at/${match[1]}/${match[2]}?autoplay=1${langParam}`
    }
  }
  return `https://tube.bluvy.app/embed/player?stream=${encodeURIComponent(
    embed.playlist,
  )}&poster=${encodeURIComponent(embed.thumbnail ?? '')}&autoplay=1${langParam}`
}

interface Props {
  embed: app.bsky.embed.video.View
  post?: app.bsky.feed.defs.PostView
}

export function BluvyTubePlayer({embed, post}: Props) {
  const t = useTheme()
  const {i18n, t: l} = useLingui()
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const windowDims = useWindowDimensions()

  const [isPlayerActive, setIsPlayerActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const playerUri = useMemo(() => {
    return getBluvyTubeEmbedUri(embed, post, i18n.locale)
  }, [embed, post, i18n.locale])

  const viewRef = useAnimatedRef()
  const frameCallback = useFrameCallback(() => {
    const measurement = measure(viewRef)
    if (!measurement) return

    const {height: winHeight, width: winWidth} = windowDims
    const realWinHeight = IS_NATIVE
      ? winHeight > winWidth
        ? winHeight
        : winWidth
      : winHeight

    const top = measurement.pageY
    const bot = measurement.pageY + measurement.height
    const isVisible = top <= realWinHeight - insets.bottom && bot >= insets.top

    if (!isVisible) {
      scheduleOnRN(setIsPlayerActive, false)
    }
  }, false)

  useEffect(() => {
    if (!isPlayerActive) return

    const unsubscribe = navigation.addListener('blur', () => {
      setIsPlayerActive(false)
    })

    frameCallback.setActive(true)

    return () => {
      unsubscribe()
      frameCallback.setActive(false)
    }
  }, [navigation, isPlayerActive, frameCallback])

  const onLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const onPlayPress = useCallback((event: GestureResponderEvent) => {
    event.preventDefault()
    setIsPlayerActive(true)
  }, [])

  // The enclosing ConstrainedImage already establishes the aspect-ratio box
  // this fills — don't impose a second one here.
  return (
    <Animated.View
      ref={viewRef}
      collapsable={false}
      style={[a.flex_1, a.overflow_hidden, a.rounded_md]}>
      {(!isPlayerActive || isLoading) &&
        (embed.thumbnail ? (
          <>
            <Image
              style={[a.flex_1]}
              source={{uri: embed.thumbnail}}
              accessibilityIgnoresInvertColors
              loading="lazy"
            />
            <Fill
              style={[
                t.name === 'light' ? t.atoms.bg_contrast_975 : t.atoms.bg,
                {opacity: 0.3},
              ]}
            />
          </>
        ) : (
          <Fill
            style={[
              {
                backgroundColor:
                  t.name === 'light' ? t.palette.contrast_975 : 'black',
                opacity: 0.3,
              },
            ]}
          />
        ))}

      {(!isPlayerActive || isLoading) && (
        <View style={[a.absolute, a.inset_0, {zIndex: 2}]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={l`Play Video with Bluvy Tube`}
            accessibilityHint={l`Plays the video`}
            onPress={onPlayPress}
            style={[a.flex_1, a.justify_center, a.align_center]}>
            {!isPlayerActive ? (
              <PlayButtonIcon />
            ) : (
              <ActivityIndicator size="large" color="white" />
            )}
          </Pressable>
        </View>
      )}

      {isPlayerActive && (
        <>
          <EventStopper style={[a.absolute, a.inset_0, {zIndex: 3}]}>
            <WebView
              javaScriptEnabled={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              bounces={false}
              allowsFullscreenVideo
              nestedScrollEnabled
              source={{uri: playerUri}}
              onLoad={onLoad}
              style={a.bg_transparent}
              setSupportMultipleWindows={false}
            />
          </EventStopper>
          <KeepAwake />
        </>
      )}
    </Animated.View>
  )
}
