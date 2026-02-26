// (teacher)/(tabs)/classes/_layout.jsx


import { Stack } from 'expo-router'

const ClassesLayout = () => {
  return (
    <Stack screenOptions={{headerShown : false}}>
        <Stack.Screen name='index' />
        <Stack.Screen name="[id]" /> 

    </Stack>
  )
}

export default ClassesLayout