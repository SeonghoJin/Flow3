// @flow
import * as React from 'react';
import {Image, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {BasicButton} from '../../../components/BasicButton';
import {ChallengeGameStackNavigationProp} from '../../stack/ChallengeGameStack';
import {useCallback, useEffect, useRef, useState} from 'react';
import Animated, {useSharedValue, withSpring} from 'react-native-reanimated';
import useLayout from 'react-native-paper/lib/typescript/utils/useLayout';
import {SpeedRunDifficulty} from './SpeedRunDifficulty';
import {useIsFocused} from '@react-navigation/native';
import {rankingRepository} from '../../../repository/RankingRepository';
import {SpeedRunService} from '../../../api/service/SpeedRunService';
import {speedRunService} from '../../../api';

type Props = {} & ChallengeGameStackNavigationProp;

const diffColor = ['#50E989', 'blue', 'black'];

export const ChallengeGameSelect = ({navigation}: Props) => {
  const isFocused = useIsFocused();
  const [highRank, setHighRank] = useState<number>(0);
  const [lowRank, setLowRank] = useState<number>(0);
  const [intermediateRank, setIntermediateRank] = useState<number>(0);
  const [highRankTop3, setHighRankTop3] = useState<Array<number>>([]);
  const [intermediateRankTop3, setIntermediateTop3] = useState<Array<number>>(
    [],
  );
  const [lowRankTop3, setLowRankTop3] = useState<Array<number>>([]);
  const [top3, setTop3] = useState<Array<Array<number>>>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [height, setHeight] = useState<number>(0);
  const [top3Diff, setTop3Diff] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setIntermediateRank(await rankingRepository.getIntermediateRank());
      setHighRank(await rankingRepository.getHighRank());
      setLowRank(await rankingRepository.getLowRank());
    })();
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    (async () => {
      const response = await Promise.all([
        speedRunService.getRankList('High'),
        speedRunService.getRankList('Intermediate'),
        speedRunService.getRankList('Low'),
      ]);

      setHighRankTop3(
        response[0].data.map((value) => {
          return value.answerCount;
        }),
      );

      setIntermediateTop3(
        response[1].data.map((value) => {
          return value.answerCount;
        }),
      );

      setLowRankTop3(
        response[2].data.map((value) => {
          return value.answerCount;
        }),
      );
    })();
  }, [isFocused]);

  useEffect(() => {
    setTop3([
      [...lowRankTop3, 0, 0, 0],
      [...intermediateRankTop3, 0, 0, 0],
      [...highRankTop3, 0, 0, 0],
    ]);
  }, [lowRankTop3, intermediateRankTop3, highRankTop3]);

  useEffect(() => {
    if (isFocused) {
      show(top3Diff);
    }
  }, [
    isFocused,
    top3Diff,
    lowRankTop3,
    highRankTop3,
    intermediateRankTop3,
    height,
  ]);

  const goSpeedRun = useCallback((difficulty: SpeedRunDifficulty) => {
    navigation.navigate('SpeedRun', {
      difficulty,
    });
  }, []);

  const graphAnim = Array(3)
    .fill(null)
    .map((_) => useRef(new Animated.Value(0)).current);

  const onGraphFrameContainerLayout = ({
    nativeEvent: {
      layout: {x, y, width, height},
    },
  }) => setHeight(height);

  const show = (difficulty: number) => {
    graphAnim.forEach((v, idx) => {
      v.setValue(0);
      Animated.spring(v, {
        stiffness: 300,
        mass: 1,
        damping: 15,
        overshootClamping: false,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
        toValue:
          (height * (top3[difficulty][idx] + 1) * 0.8) /
          (top3[difficulty][0] + 1),
      }).start();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.HOFLayout}>
        <View style={styles.rankingDifficultyLayout}>
          <View style={styles.buttonBasicLayout}>
            <BasicButton
              onPressed={() => {
                setTop3Diff(0);
              }}
              text={'초급 TOP3'}></BasicButton>
          </View>
          <View style={styles.buttonBasicLayout}>
            <BasicButton
              onPressed={() => {
                setTop3Diff(1);
              }}
              text={'중급 TOP3'}></BasicButton>
          </View>
          <View style={styles.buttonBasicLayout}>
            <BasicButton
              onPressed={() => {
                setTop3Diff(2);
              }}
              text={'고급 TOP3'}></BasicButton>
          </View>
        </View>
        <View
          style={styles.graphFrameLayout}
          onLayout={onGraphFrameContainerLayout}>
          <Animated.View
            style={[
              styles.graphLayout,
              {height: graphAnim[2], backgroundColor: diffColor[top3Diff]},
            ]}>
            <Animated.Text style={styles.rankTextStyle}>
              {top3[top3Diff][2]}
            </Animated.Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.graphLayout,
              {height: graphAnim[0], backgroundColor: diffColor[top3Diff]},
            ]}>
            <Text style={styles.rankTextStyle}>{top3[top3Diff][0]}</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.graphLayout,
              {height: graphAnim[1], backgroundColor: diffColor[top3Diff]},
            ]}>
            <Text style={styles.rankTextStyle}>{top3[top3Diff][1]}</Text>
          </Animated.View>
        </View>
      </View>
      <View style={styles.selectGameLayout}>
        <View
          style={[styles.difficultyLayout, {backgroundColor: diffColor[0]}]}>
          <Text style={styles.textStyle}>초급 </Text>
          <Text style={styles.rankTextStyle}>{lowRank}점 </Text>
          <View style={styles.buttonLayout}>
            <BasicButton onPressed={() => {}} text={'순위표'}></BasicButton>
          </View>
          <View style={styles.buttonLayout}>
            <BasicButton
              onPressed={() => {
                goSpeedRun('Low');
              }}
              text={'도전!'}></BasicButton>
          </View>
        </View>
        <View
          style={[styles.difficultyLayout, {backgroundColor: diffColor[1]}]}>
          <Text style={styles.textStyle}>중급</Text>
          <Text style={styles.rankTextStyle}>{intermediateRank}점 </Text>
          <View style={styles.buttonLayout}>
            <BasicButton onPressed={() => {}} text={'순위표'}></BasicButton>
          </View>
          <View style={styles.buttonLayout}>
            <BasicButton
              onPressed={() => {
                goSpeedRun('Intermediate');
              }}
              text={'도전!'}></BasicButton>
          </View>
        </View>

        <View
          style={[styles.difficultyLayout, {backgroundColor: diffColor[2]}]}>
          <Text style={styles.textStyle}>고급 </Text>
          <Text style={styles.rankTextStyle}>{highRank}점 </Text>
          <View style={styles.buttonLayout}>
            <BasicButton onPressed={() => {}} text={'순위표'}></BasicButton>
          </View>
          <View style={styles.buttonLayout}>
            <BasicButton
              onPressed={() => {
                goSpeedRun('High');
              }}
              text={'도전!'}></BasicButton>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    padding: 0,
  },
  imageLayout: {
    width: '100%',
    height: '50%',
  },
  HOFLayout: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E0E0',
  },
  selectGameLayout: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingDifficultyLayout: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphFrameLayout: {
    flex: 3,
    width: '100%',
    height: '100%',
    padding: 0,
    paddingLeft: '20%',
    paddingRight: '20%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  graphLayout: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: 0,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 2,
  },
  buttonLayout: {
    flex: 1,
    width: 0,
    height: '50%',
    margin: 5,
  },
  difficultyLayout: {
    flexDirection: 'row',
    width: '100%',
    //height: 70,
    flex: 1,
    marginBottom: 10,
    backgroundColor: '#2196F3',
    elevation: 2,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  rankTextStyle: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 25,
  },
  buttonBasicLayout: {
    flex: 1,
    width: 0,
    margin: 5,
  },
});
