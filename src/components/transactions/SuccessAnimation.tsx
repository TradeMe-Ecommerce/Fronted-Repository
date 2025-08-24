import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface SuccessAnimationProps {
  message?: string;
  redirectDelay?: number;
  redirectTo?: string;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  message = 'Purchase completed successfully!',
  redirectDelay = 2000,
  redirectTo = '/'
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo);
    }, redirectDelay);

    return () => clearTimeout(timer);
  }, [navigate, redirectDelay, redirectTo]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: 'success.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scaleIn 0.5s ease-out',
          '&::after': {
            content: '""',
            width: '40%',
            height: '60%',
            border: '4px solid white',
            borderTop: 'none',
            borderLeft: 'none',
            transform: 'rotate(45deg) translateY(-10%)',
          }
        }}
      />
      <Typography
        variant="h5"
        sx={{
          mt: 2,
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        {message}
      </Typography>
      <style>
        {`
          @keyframes scaleIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default SuccessAnimation; 