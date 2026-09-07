import {useCallback, useMemo, useState} from 'react'
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  View,
} from 'react-native'
import {useLingui} from '@lingui/react/macro'

import {EventStopper} from '#/view/com/util/EventStopper'
import {atoms as a, useTheme} from '#/alf'
import {Fill} from '#/components/Fill'
import {PlayButtonIcon} from '#/components/video/PlayButtonIcon'
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

  const [isPlayerActive, setIsPlayerActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const playerUri = useMemo(() => {
    return getBluvyTubeEmbedUri(embed, post, i18n.locale)
  }, [embed, post, i18n.locale])

  const onLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const onPlayPress = useCallback((event: GestureResponderEvent) => {
    event.preventDefault()
    setIsPlayerActive(true)
  }, [])

  // The enclosing ConstrainedImage already establishes the aspect-ratio box
  // this fills — don't impose a second one here (that left dead space
  // whenever the two ratios disagreed, e.g. a video with no aspectRatio
  // metadata falling back to 16:9 inside a 1:1 box).
  return (
    <View
      style={[a.flex_1, a.w_full, a.overflow_hidden, a.rounded_md, a.relative]}>
      {embed.thumbnail && (!isPlayerActive || isLoading) && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${embed.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {(!isPlayerActive || isLoading) && (
        <Fill
          style={[
            {
              backgroundColor:
                t.name === 'light' ? t.palette.contrast_975 : 'black',
              opacity: 0.3,
            },
          ]}
        />
      )}

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
        <EventStopper style={[a.absolute, a.inset_0, {zIndex: 3}]}>
          <iframe
            src={playerUri}
            title={embed.alt || 'Bluvy Tube Video Player'}
            onLoad={onLoad}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'transparent',
            }}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        </EventStopper>
      )}
    </View>
  )
}
