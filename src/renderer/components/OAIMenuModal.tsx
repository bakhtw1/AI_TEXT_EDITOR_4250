import React, { useEffect, useState, ChangeEvent } from 'react';
import Typography from '@mui/material/Typography';
import { Box, Button, Modal, Stack } from '@mui/material';
import { TextField, MenuItem } from '@mui/material';
import { useAssistantManager } from './AssistantManager';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function OAIMenuModal() {
  const [open, setOpen] = useState(false);
  const [tokenField, setTokenField] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selected, setSelected] = useState('');
  const [engineList, setEngineList] = useState<string[]>([]);
  const assistantManager = useAssistantManager();

  async function initEngineList() {
    
    console.log(tokenField)
    const result = await assistantManager?.getOAIEngines(tokenField);
    if (result) { 
      console.log(result);
      if (result.length > 0) {
        setEngineList(result); 
      }
      // else {
      //   initEngineList();
      // }
    }   
    
  }

  useEffect(() => {


    initEngineList();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
    setSelectedModel(engineList[Number(event.target.value)]);
  }

  const handleTokenChange = (event: ChangeEvent<HTMLInputElement>) => {    
    setTokenField(event.target.value);
    
  }

  const handleSubmit = () => {
    initEngineList();
    assistantManager?.setOAIParams(tokenField, selectedModel);
    handleClose();
  }

  return (
    <div>
      <Button onClick={handleOpen}>
        OpenAI
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography paddingBottom="15px" id="modal-modal-title" variant="h6" component="h2">
            OpenAI Assistant Settings
          </Typography>
          <Stack direction="column" spacing="15px">
            <TextField 
              id="outlined-basic" 
              label="enter OpenAI token" 
              variant="outlined" 
              value={tokenField}
              onChange={handleTokenChange}
            />
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={selected}
              onChange={handleChange}
              label="Engine"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {engineList.map((engine : string, idx : number) => 
                <MenuItem key={idx} value={idx}>{engine}</MenuItem>)}
            </Select>
            <Button 
              variant='contained' 
              fullWidth={false} 
              onClick={handleSubmit}>
                Submit
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}