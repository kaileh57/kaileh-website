import React, { useState, useEffect } from 'react';
import { TextField, PrimaryButton, Stack, Text } from '@fluentui/react';
import { useId } from '@fluentui/react-hooks';
import LoadingAnimation from './LoadingAnimation';

const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [showContinue, setShowContinue] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const textFieldId = useId('api-key-input');

  const handleApiKeyChange = (event, newValue) => {
    setApiKey(newValue || '');
    setShowContinue(!!newValue);
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      setIsLoading(true);
    }
    // Clear the API key input field
    setApiKey('');
    setShowContinue(false);
  };

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsComplete(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <Stack
      tokens={{ childrenGap: 20, padding: 40 }}
      styles={{
        root: {
          width: '60vw',
          height: '60vh',
          margin: '20vh auto',
          backgroundColor: 'white',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
        }
      }}
    >
      {!isComplete && (
        <>
          <Text
            styles={{
              root: {
                position: 'absolute',
                top: '20px',
                left: step === 1 ? '20px' : (step === 2 ? 'calc(100% - 100px)' : '-100px'),
                transition: 'all 0.5s ease',
                fontWeight: 'bold',
                fontSize: '24px',
                opacity: step === 1 ? 1 : 0,
              }
            }}
          >
            Step 1:
          </Text>
          <Text
            styles={{
              root: {
                position: 'absolute',
                top: '20px',
                left: step === 2 ? 'calc(100% - 100px)' : (step === 3 ? '20px' : 'calc(100% + 100px)'),
                transition: 'all 0.5s ease',
                fontWeight: 'bold',
                fontSize: '24px',
                opacity: step === 2 ? 1 : (step === 3 ? 0 : 0),
              }
            }}
          >
            Step 2:
          </Text>
          <Text
            styles={{
              root: {
                position: 'absolute',
                top: '20px',
                left: step === 3 ? '20px' : 'calc(100% + 100px)',
                transition: 'all 0.5s ease',
                fontWeight: 'bold',
                fontSize: '24px',
                opacity: step === 3 ? 1 : 0,
              }
            }}
          >
            Step 3:
          </Text>
        </>
      )}
      {!isLoading && !isComplete && (
        <Stack
          styles={{
            root: {
              height: '100%',
              justifyContent: 'center',
              animation: 'fadeInSlideUp 0.5s ease-out',
            }
          }}
        >
          <Text
            variant="xxLarge"
            block
            styles={{
              root: {
                marginBottom: '20px',
                transition: 'opacity 0.5s ease',
                opacity: step === 1 ? 1 : 0,
                position: 'absolute',
                top: '38%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
            }}
          >
            Enter your Netskope API Key
          </Text>
          <Text
            variant="xxLarge"
            block
            styles={{
              root: {
                marginBottom: '20px',
                transition: 'opacity 0.5s ease',
                opacity: step === 2 ? 1 : 0,
                position: 'absolute',
                top: '38%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
            }}
          >
            Enter your GSA API Key
          </Text>
          <TextField
            id={textFieldId}
            value={apiKey}
            onChange={handleApiKeyChange}
            styles={{
              fieldGroup: {
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
              }
            }}
          />
          <Stack.Item
            styles={{
              root: {
                height: '40px',
                marginTop: '20px',
              }
            }}
          >
            {showContinue && (
              <PrimaryButton
                text="Continue"
                onClick={handleContinue}
                styles={{
                  root: {
                    backgroundColor: '#0078d4',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    animation: 'fadeIn 0.5s ease-in-out'
                  }
                }}
              />
            )}
          </Stack.Item>
        </Stack>
      )}
      {isLoading && !isComplete && <LoadingAnimation />}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Stack>
  );
};

export default ApiKeyInput;