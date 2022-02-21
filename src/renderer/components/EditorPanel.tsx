import { Tabs, Tab, Box, Typography } from '@mui/material';  
import { Add } from '@mui/icons-material';
import React, { SyntheticEvent, useState } from 'react';
import EditorComponent from './Editor';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface EditorPanelProps {
  value: number,
  content: Array<{
    key:number, 
    id:number, 
    data:string, 
    path:string, 
    filename:string
    ext:string
  }>,
  changeHandler: any,
  editHandler: any
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

export default function EditorPanel(props:EditorPanelProps) {

  return (
    <div>
      <Tabs
        value={props.value}
        onChange={props.changeHandler}
        variant="scrollable"
      >
        {props.content.map((child: any) => 
          <Tab label={child.filename} {...a11yProps(child.id)} />)
        }
        <Tab icon={<Add />} value={-1}/>
      </Tabs> 
      <Box>
        {props.content.map((child: any) => 
          <TabPanel value={props.value} index={child.id} key={child.key}>
            <EditorComponent 
              data={child.data} 
              path={child.path} 
              filename={child.filename} 
              ext={child.ext}
              editHandler={props.editHandler}/>
          </TabPanel>)
        }
      </Box>
    </div>
  );

}



