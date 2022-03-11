import { Tabs, Tab, Box, Grid } from '@mui/material';  
import { Add } from '@mui/icons-material';
import React, { SyntheticEvent } from 'react';
import EditorComponent from './Editor';
import { AppFile, useFileSystem } from './FileSystem';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function EditorPanel() {
  const fileSystem = useFileSystem();

  const handleTabChange = (event: SyntheticEvent<Element, Event>, newTabId: number) => {
    if (newTabId === -1) {
      fileSystem?.newFile();
    } else {
      fileSystem?.setCurrentFileIdx(newTabId);
    }
  };

  return (
    <div>
      <Tabs
        value={fileSystem?.currentFileIdx || 0}
        onChange={handleTabChange}
        variant="scrollable"
      >
        {fileSystem?.files.map((f: AppFile, index: number) => 
          <Tab 
            label={f.name} 
            key={index}
            {...a11yProps(index)} 
          />
        )}
        <Tab 
          icon={<Add />} 
          value={-1}
        />
      </Tabs> 
      <Box>
        {fileSystem?.files.map((f: AppFile, index: number) => 
          <TabPanel value={fileSystem.currentFileIdx} index={index} key={index}>
            <EditorComponent 
              file={f}
            />
          </TabPanel>
        )}
      </Box>
    </div>
  );
}



