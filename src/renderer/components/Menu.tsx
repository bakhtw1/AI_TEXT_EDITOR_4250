import { Box, Grid, Button, Menu, MenuItem } from '@mui/material';  
import React, { MouseEvent, useState } from 'react';
import { ipcRenderer } from 'electron';
import path from 'path';
interface MenuProps {
  openFileEvent: any
}

export default function CustomMenu(props: MenuProps) {
  return (
    <Box sx={{flexGrow: 1}}>
      <Grid container>
        <Grid item xs={8}>
          <FileMenu openFileEvent={props.openFileEvent}/>
        </Grid>
      </Grid>
    </Box>
  );  
}

function FileMenu(props: MenuProps) {
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => { 
    setAnchorEl(null);
  };

  const openFile = async () => {
    const filepath = await ipcRenderer.invoke('file-dialog-handle');
    const filecontents = await ipcRenderer.invoke('file-contents-handle', filepath.filePaths[0]);
    const fpath = filepath.filePaths[0];
    const basename = path.basename(fpath);
    const ext = path.extname(basename);
    
    props.openFileEvent(filecontents, path, basename, ext);
  }

  return ( 
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{color:"#000000"}}
      >
        File
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={openFile}>Open</MenuItem>
      </Menu>
    </div>
  );
}
