import {Fragment} from 'react'
import {View} from 'react-native'
import {Trans} from '@lingui/react/macro'

import {
  type CommonNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {
  type EmbedPlayerSource,
  exemptExternalEmbedSources,
  externalEmbedLabels,
} from '#/lib/strings/embed-player'
import {
  useBluvyTubePlayer,
  useExternalEmbedsPrefs,
  useSetBluvyTubePlayer,
  useSetExternalEmbedPref,
} from '#/state/preferences'
import {atoms as a, native} from '#/alf'
import {Admonition} from '#/components/Admonition'
import * as Toggle from '#/components/forms/Toggle'
import * as Layout from '#/components/Layout'
import * as SettingsList from './components/SettingsList'

type Props = NativeStackScreenProps<
  CommonNavigatorParams,
  'PreferencesExternalEmbeds'
>
export function ExternalMediaPreferencesScreen({}: Props) {
  const useBluvyTube = useBluvyTubePlayer()
  const setUseBluvyTube = useSetBluvyTubePlayer()

  return (
    <Layout.Screen testID="externalMediaPreferencesScreen">
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>External Media Preferences</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Content>
        <SettingsList.Container>
          <SettingsList.Group iconInset={false}>
            <SettingsList.ItemText>
              <Trans>Bluvy Tube Integration</Trans>
            </SettingsList.ItemText>
            <View style={[a.mt_sm, a.w_full]}>
              <Toggle.Item
                name="bluvyTubePlayerToggle"
                label="Use Bluvy Tube video player"
                type="checkbox"
                value={useBluvyTube}
                onChange={() => setUseBluvyTube(!useBluvyTube)}
                style={[
                  a.flex_1,
                  a.py_md,
                  native([a.justify_between, a.flex_row_reverse]),
                ]}>
                <Toggle.Platform />
                <View style={[a.flex_1, a.gap_2xs]}>
                  <Toggle.LabelText style={[a.text_md, a.font_semi_bold]}>
                    <Trans>Use Bluvy Tube video player</Trans>
                  </Toggle.LabelText>
                  <Toggle.LabelText style={[a.text_sm, a.leading_snug]}>
                    <Trans>
                      Plays videos with the enhanced Bluvy Tube player (playback
                      speed, chapters and captions).
                    </Trans>
                  </Toggle.LabelText>
                </View>
              </Toggle.Item>
            </View>
          </SettingsList.Group>

          <SettingsList.Item>
            <Admonition type="info" style={[a.flex_1]}>
              <Trans>
                External media may allow websites to collect information about
                you and your device. No information is sent or requested until
                you press the "play" button.
              </Trans>
            </Admonition>
          </SettingsList.Item>
          <SettingsList.Group iconInset={false}>
            <SettingsList.ItemText>
              <Trans>Enable media players for</Trans>
            </SettingsList.ItemText>
            <View style={[a.mt_sm, a.w_full]}>
              {native(<SettingsList.Divider style={[a.my_0]} />)}
              {Object.entries(externalEmbedLabels)
                .filter(
                  ([key]) =>
                    !exemptExternalEmbedSources.has(key as EmbedPlayerSource),
                )
                .map(([key, label]) => (
                  <Fragment key={key}>
                    <PrefSelector
                      source={key as EmbedPlayerSource}
                      label={label}
                      key={key}
                    />
                    {native(<SettingsList.Divider style={[a.my_0]} />)}
                  </Fragment>
                ))}
            </View>
          </SettingsList.Group>
        </SettingsList.Container>
      </Layout.Content>
    </Layout.Screen>
  )
}

function PrefSelector({
  source,
  label,
}: {
  source: EmbedPlayerSource
  label: string
}) {
  const setExternalEmbedPref = useSetExternalEmbedPref()
  const sources = useExternalEmbedsPrefs()

  return (
    <Toggle.Item
      name={label}
      label={label}
      type="checkbox"
      value={sources?.[source] === 'show'}
      onChange={() =>
        setExternalEmbedPref(
          source,
          sources?.[source] === 'show' ? 'hide' : 'show',
        )
      }
      style={[
        a.flex_1,
        a.py_md,
        native([a.justify_between, a.flex_row_reverse]),
      ]}>
      <Toggle.Platform />
      <Toggle.LabelText style={[a.text_md]}>{label}</Toggle.LabelText>
    </Toggle.Item>
  )
}
