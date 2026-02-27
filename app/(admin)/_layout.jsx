import { Stack } from 'expo-router'

const adminLayout = () => {
  return (
    <Stack screenOptions={{headerShown : false}}>
        <Stack.Screen name='(tabs)' />
    </Stack>
  )
}

export default adminLayout