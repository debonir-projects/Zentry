import { useState } from "react";
import { StyleSheet, TextInput as RNTextInput, TextInputProps as RNTextInputProps, View } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface TextInputProps extends RNTextInputProps {
  lightColor?: string;
  darkColor?: string;
}

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const [isFocused, setIsFocused] = useState(false);
  
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, isFocused ? 'tint' : 'icon');
  
  return (
    <View style={[styles.container, { borderColor }]}>
      <RNTextInput
        style={[
          styles.input,
          { color, backgroundColor },
          style,
        ]}
        placeholderTextColor={useThemeColor({}, 'icon')}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...otherProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});