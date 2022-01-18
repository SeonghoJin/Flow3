// @flow
import * as React from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {PatternModule} from './PatternModule/PatternModule';
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {dailyRepository} from '../../repository/DailyRepository';
import {useIsFocused} from '@react-navigation/native';
import {hintRepository} from '../../repository/HintRepository';
import {PatternRandomGenerator} from './PatternRandomGenerator';
import {MainTabNavigationProp} from '../Main/Main';

type Props = {} & MainTabNavigationProp;
export const DailyPattern = ({navigation}: Props) => {
  const initialPattern = useRef(new PatternRandomGenerator().generate());
  const [daily, setDaily] = useState(Date.now());
  const isFocused = useIsFocused();
  const [canSolve, setCanSolve] = useState(true);
  const [canSolvedDateLower, setCanSolvedDateLower] = useState<number>(
    Date.now(),
  );

  const onSuccess = useCallback(() => {
    (async () => {
      await hintRepository.plusHintCount();
      setDaily(await dailyRepository.setSolvedAt(Date.now()));
    })();
  }, []);

  const onSuccessModalPressed = useCallback(() => {
    (async () => {
      navigation.navigate('StageGameStack');
      setCanSolve(true);
      initialPattern.current = new PatternRandomGenerator().generate();
    })();
  }, []);

  useLayoutEffect(() => {
    (async () => {
      const _daily = await dailyRepository.getSolvedAt();
      const _currentDate = new Date(_daily);
      const _canSolvedDateLower = _currentDate.setSeconds(
        _currentDate.getSeconds() + 30,
      );

      setCanSolvedDateLower(_canSolvedDateLower);
      setDaily(_daily);
      if (_canSolvedDateLower <= Date.now()) {
        setCanSolve(true);
      } else {
        setCanSolve(false);
      }
    })();
  }, [isFocused, daily]);

  return (
    <SafeAreaView
      style={{
        width: '100%',
        height: '100%',
      }}>
      <PatternModule
        answerIndices={initialPattern.current}
        onSuccess={onSuccess}></PatternModule>
      <Modal animationType="fade" transparent={false} visible={!canSolve}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Pressable style={[styles.button]} onPress={onSuccessModalPressed}>
              <Text style={styles.textStyle}>오늘의 문제 푸셨습니다.</Text>
              <Text style={styles.textStyle}>힌트가 1 증가합니다.</Text>
              <Text style={styles.textStyle}>
                푼 시각 : {new Date(daily).toLocaleString()}
              </Text>
              <Text style={styles.textStyle}>
                내일의 문제를 풀 수 있는 시각 푼 시간 :
                {new Date(canSolvedDateLower).toLocaleString()}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});