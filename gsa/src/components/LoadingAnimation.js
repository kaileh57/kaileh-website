import React from 'react';
import { Stack, Text, Image } from '@fluentui/react';

const LoadingAnimation = () => {
  return (
    <Stack
      verticalAlign="center"
      horizontalAlign="center"
      styles={{
        root: {
          height: '100%',
          animation: 'fadeInSlideUp 0.5s ease-out',
        }
      }}
    >
      <Image 
        src="/logo192.png" 
        alt="React Logo"
        width={100}
        height={100}
        styles={{
          root: {
            animation: 'spin 2s linear infinite',
          }
        }}
      />
      <Text 
        variant="xxLarge"
        styles={{ 
          root: { 
            marginTop: 20,
            fontWeight: 'bold',
          } 
        }}
      >
        Fetching Private Apps From Netskope
      </Text>
    </Stack>
  );
};

export default LoadingAnimation;