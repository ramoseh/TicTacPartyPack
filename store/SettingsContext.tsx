import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  minTime: number;
  maxTime: number;
  guessMax: number;
  multiplyMin: number;
  multiplyMax: number;
  forbiddenLetterMax: number;
  backgroundImage: string;
  setMinTime: (time: number) => void;
  setMaxTime: (time: number) => void;
  setGuessMax: (val: number) => void;
  setMultiplyMin: (val: number) => void;
  setMultiplyMax: (val: number) => void;
  setForbiddenLetterMax: (val: number) => void;
  setBackgroundImage: (val: string) => void;
  saveSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [minTime, setMinTime] = useState(10);
  const [maxTime, setMaxTime] = useState(60);
  const [guessMax, setGuessMaxState] = useState(10);
  const [multiplyMin, setMultiplyMinState] = useState(11);
  const [multiplyMax, setMultiplyMaxState] = useState(99);
  const [forbiddenLetterMax, setForbiddenLetterMaxState] = useState(10);
  const [backgroundImage, setBackgroundImage] = useState<string>('default');

  const loadSettings = async () => {
    try {
      const savedMin = await AsyncStorage.getItem('minTime');
      const savedMax = await AsyncStorage.getItem('maxTime');
      const savedGuessMax = await AsyncStorage.getItem('guessMax');
      const savedMultiplyMin = await AsyncStorage.getItem('multiplyMin');
      const savedMultiplyMax = await AsyncStorage.getItem('multiplyMax');
      const savedForbiddenLetterMax = await AsyncStorage.getItem('forbiddenLetterMax');
      const savedBackground = await AsyncStorage.getItem('backgroundImage');

      if (savedMin) setMinTime(Number(savedMin));
      if (savedMax) setMaxTime(Number(savedMax));
      if (savedGuessMax) setGuessMaxState(Number(savedGuessMax));
      if (savedMultiplyMin) setMultiplyMinState(Number(savedMultiplyMin));
      if (savedMultiplyMax) setMultiplyMaxState(Number(savedMultiplyMax));
      if (savedForbiddenLetterMax) setForbiddenLetterMaxState(Number(savedForbiddenLetterMax));
      if (savedBackground) setBackgroundImage(savedBackground);
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      // Basic validation
      let finalMin = minTime;
      let finalMax = maxTime;
      let finalForbidden = Math.max(3, forbiddenLetterMax);

      if (finalMin < 1) finalMin = 1;
      if (finalMax < finalMin) finalMax = finalMin + 1;

      setMinTime(finalMin);
      setMaxTime(finalMax);
      setForbiddenLetterMaxState(finalForbidden);

      await AsyncStorage.setItem('minTime', String(finalMin));
      await AsyncStorage.setItem('maxTime', String(finalMax));
      await AsyncStorage.setItem('guessMax', String(guessMax));
      await AsyncStorage.setItem('multiplyMin', String(multiplyMin));
      await AsyncStorage.setItem('multiplyMax', String(multiplyMax));
      await AsyncStorage.setItem('forbiddenLetterMax', String(finalForbidden));
      await AsyncStorage.setItem('backgroundImage', backgroundImage);
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  const updateMinTime = async (val: number) => {
    setMinTime(val);
    await AsyncStorage.setItem('minTime', String(val));
  };

  const updateMaxTime = async (val: number) => {
    setMaxTime(val);
    await AsyncStorage.setItem('maxTime', String(val));
  };

  const updateGuessMax = async (val: number) => {
    setGuessMaxState(val);
    await AsyncStorage.setItem('guessMax', String(val));
  };

  const updateMultiplyMin = async (val: number) => {
    setMultiplyMinState(val);
    await AsyncStorage.setItem('multiplyMin', String(val));
  };

  const updateMultiplyMax = async (val: number) => {
    setMultiplyMaxState(val);
    await AsyncStorage.setItem('multiplyMax', String(val));
  };

  const updateForbiddenLetterMax = async (val: number) => {
    // Enforce minimum of 3
    const finalVal = Math.max(3, val);
    setForbiddenLetterMaxState(finalVal);
    await AsyncStorage.setItem('forbiddenLetterMax', String(finalVal));
  };

  const updateBackgroundImage = async (val: string) => {
    setBackgroundImage(val);
    await AsyncStorage.setItem('backgroundImage', val);
  };

  return (
    <SettingsContext.Provider
      value={{
        minTime,
        maxTime,
        guessMax,
        multiplyMin,
        multiplyMax,
        forbiddenLetterMax,
        backgroundImage,
        setMinTime: updateMinTime,
        setMaxTime: updateMaxTime,
        setGuessMax: updateGuessMax,
        setMultiplyMin: updateMultiplyMin,
        setMultiplyMax: updateMultiplyMax,
        setForbiddenLetterMax: updateForbiddenLetterMax,
        setBackgroundImage: updateBackgroundImage,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
