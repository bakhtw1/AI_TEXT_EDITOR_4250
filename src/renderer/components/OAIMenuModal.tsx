import React, { useEffect, useState, ChangeEvent } from 'react';
import Typography from '@mui/material/Typography';
import { Box, Button, InputLabel, Modal, Stack, styled, TextFieldProps } from '@mui/material';
import { TextField, MenuItem } from '@mui/material';
import { useAssistantManager } from './AssistantManager';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ipcRenderer } from 'electron';
import { ThemeStyle, useColorScheme, useTheme } from '../config/Theme';

const StyledTextField = styled((props: TextFieldProps) => {
  return <TextField {...props} />
})(() => {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return {
    '& label': {
      color: colorScheme === ThemeStyle.light ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    },
    '& label.Mui-focused': {
      color: theme.text.color,
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.text.color,
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.text.color,
      },
      '&:hover fieldset': {
        borderColor: theme.text.color,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.text.color,
      },
      '& .MuiOutlinedInput-input': {
        color: theme.text.color
      }
    },
  };
});

export default function OAIMenuModal() {
  const [open, setOpen] = useState(false);
  const [tokenField, setTokenField] = useState('');
  // const [selectedModel, setSelectedModel] = useState('');
  const assistantManager = useAssistantManager();
  
  const theme = useTheme();
  const colorScheme = useColorScheme();

  useEffect(() => {
    ipcRenderer.invoke('get-config').then(() => null);

    ipcRenderer.on('settings-open', () => {
      setOpen(true);
    });

    ipcRenderer.on('loaded-config', (event, data) => {
      const token = data.openAI.token;
      const tabSize = data.openAI.tabSize;

      setTokenField(token);
      assistantManager?.setOAIParams(token);
    });
  }, []);

  // const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleTokenChange = (event: ChangeEvent<HTMLInputElement>) => {    
    setTokenField(event.target.value);
  }

  const handleSubmit = () => {
    assistantManager?.setOAIParams(tokenField);

    ipcRenderer.invoke('set-config', {
      openAI: {
        token: tokenField
      },
    });

    handleClose();
  }

  return (
    <div>
      {/* <Button onClick={handleOpen}>
        OpenAI
      </Button> */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          // border: '2px solid #000',
          backgroundColor: theme.colors.editorBackground,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography 
            id="modal-modal-title" 
            variant="h6" 
            fontWeight={600}
            fontSize={24}
            color={colorScheme === ThemeStyle.light ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'}
            component="h2"
          >
            Settings
          </Typography>
          <hr style={{
            height: '1px',
            backgroundColor: colorScheme === ThemeStyle.light ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
          }} />
          
          <Stack direction="column" spacing="5px">
            <Typography 
              // paddingBottom="15px" 
              variant="h6" 
              fontSize={14}
              fontWeight={600}
              color={theme.text.color}
              component="h4"
            >
              OpenAI Configuration
            </Typography>
            <StyledTextField 
              id="outlined-basic" 
              label="API Token" 
              variant="outlined" 
              value={tokenField}
              onChange={handleTokenChange}
              size='small'
            />
          </Stack>
          <hr style={{
            height: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
          }} />
          <Button 
            variant='contained' 
            fullWidth={false} 
            onClick={handleSubmit}>
              Save
          </Button>
        </Box>
      </Modal>
    </div>
  );
}