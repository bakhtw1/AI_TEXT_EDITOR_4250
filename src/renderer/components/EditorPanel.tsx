import { Tabs, Tab, Box, Grid, Stack } from '@mui/material';  
import { Add, Close, SentimentSatisfiedAltSharp } from '@mui/icons-material';
import React, { SyntheticEvent } from 'react';
import EditorComponent from './Editor';
import { AppFile, useFileSystem } from './FileSystem';
import { useTheme } from '../config/Theme';
import { IconButton } from '@mui/material';
import { Console } from 'console';
import OAIMenuModal from './OAIMenuModal';
import { width } from '@mui/system';
export const TABS_HEIGHT = 35;

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

interface iEditorPanelProps {
  height: number,
}

export default function EditorPanel(props: iEditorPanelProps) {
  const fileSystem = useFileSystem();
  const theme = useTheme();

  const handleTabChange = (event: SyntheticEvent<Element, Event>, newTabId: number) => {
    if (newTabId === -1) {
      fileSystem?.newFile();
    } else {
      fileSystem?.setCurrentFileIdx(newTabId);
    }
  };

  const handleTabClose = (event: SyntheticEvent<Element, Event>, tabId: number) => {    
    fileSystem?.closeFile(tabId);
    if (tabId > 0) {
      fileSystem?.setCurrentFileIdx(tabId - 1);
    }
  }

  const tabsValue = fileSystem?.currentFileIdx || 0;

  return (
    <div>
      <Stack direction="row">
        <Tabs
          value={tabsValue}
          onChange={handleTabChange}
          variant="scrollable"
          style={{
            height: `${TABS_HEIGHT}px`,
            minHeight: `${TABS_HEIGHT}px`,
            width: '95%',
          }}
          TabIndicatorProps={{
            style: {
                display: "none",
            },
          }}
        >
          {fileSystem?.files.map((f: AppFile, index: number) => 
            <Tab 
              style={{
                fontSize: '12px',
                // padding: '0',
                paddingRight: '5px',
                minHeight: `${TABS_HEIGHT}px`,
                height: `${TABS_HEIGHT}px`,
                color: tabsValue === index ? theme.text.color : 'grey',
                backgroundColor: tabsValue === index ? theme.colors.editorBackground : 'inherit'
              }}
              label={
                <Stack direction="row" alignItems="center">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    textAlign="center"
                    lineHeight="normal"
                  >
                    {f.name}
                  </Box> 
                  <Box
                    paddingLeft="5px"
                    onClick={(e) => handleTabClose(e, index)}
                  >
                    <Close 
                      fontSize="small" 
                      style={{
                        color : theme.text.color, 
                      }}
                    />
                  </Box>
                </Stack> 
              } 
              key={index}
              {...a11yProps(index)} 
            />
          )}
          <Tab 
            icon={<Add sx={{color: '#808080'}} fontSize='small' />} 
            value={-1}
            style={{
              // padding: '0',
              minHeight: `${TABS_HEIGHT}px`,
              height: `${TABS_HEIGHT}px`,
              minWidth: `${TABS_HEIGHT}px`,
              width: `${TABS_HEIGHT}px`
            }}
          />
        </Tabs> 
        <OAIMenuModal />
      </Stack>
      <Box>
        {fileSystem?.files.map((f: AppFile, index: number) => 
          <TabPanel value={fileSystem.currentFileIdx} index={index} key={index}>
            <EditorComponent 
              file={f}
              height={props.height - TABS_HEIGHT}
            />
          </TabPanel>
        )}
      </Box>
    </div>
  );
}



