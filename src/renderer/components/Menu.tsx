import { Box, Grid, Button, Menu, MenuItem } from '@mui/material';  
import React, { MouseEvent, useState } from 'react';
import { useFileSystem } from './FileSystem';

export default function CustomMenu() {
  return (
    <Box sx={{flexGrow: 1}}>
      <Grid container>
        <Grid item xs={8}>
          <FileMenu />
        </Grid>
      </Grid>
    </Box>
  );  
}

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
        <MenuItem onClick={async function() {
          await fileSystem?.openFile(null);
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
    </div>
  );
}
