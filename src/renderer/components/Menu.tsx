import { Box, Grid, Button, Menu, MenuItem } from '@mui/material';  
import React, { MouseEvent, useState } from 'react';
import { useFileSystem } from './FileSystem';

function FileMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const fileSystem = useFileSystem();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => { 
    setAnchorEl(null);
  };

  return ( 
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      <MenuItem onClick={async function() {
        await fileSystem?.openFile();
      }}>
        Open
      </MenuItem>
      <MenuItem onClick={async function() {
        await fileSystem?.files[fileSystem.currentFileIdx].save();
      }}>
        Save
      </MenuItem>
      <MenuItem onClick={async function() {
        await fileSystem?.files[fileSystem.currentFileIdx].saveAs();
      }}>
        Save As
      </MenuItem>
    </Menu>
  );
}
