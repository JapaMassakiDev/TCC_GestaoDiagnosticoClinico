import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const CustomButton = ({
  onPress,
  title,
  loading = false,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  disabled = false,
}) => {
  const getButtonStyles = () => {
    if (disabled || loading) return 'bg-slate-200 border-slate-200';
    switch (variant) {
      case 'secondary':
        return 'bg-pastel-green-50 border border-pastel-green-200 active:bg-pastel-green-100';
      case 'danger':
        return 'bg-red-500 border border-red-500 active:bg-red-600';
      case 'primary':
      default:
        return 'bg-pastel-green-500 border border-pastel-green-500 active:bg-pastel-green-700';
    }
  };

  const getTextStyles = () => {
    if (disabled || loading) return 'text-slate-400';
    switch (variant) {
      case 'secondary':
        return 'text-pastel-green-700 font-bold';
      case 'danger':
        return 'text-white font-bold';
      case 'primary':
      default:
        return 'text-white font-bold';
    }
  };

  return (
    <TouchableOpacity
      className={`py-3 px-6 rounded-xl flex-row justify-center items-center ${getButtonStyles()}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'secondary' ? '#2E7D32' : '#ffffff'} />
      ) : (
        <Text className={`text-base text-center ${getTextStyles()}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
