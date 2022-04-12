import React, { useState, ChangeEvent, useEffect } from 'react';
import { Box, Icon, IconButton, Stack, TextField, TextFieldProps, styled, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Search } from '@mui/icons-material';
import { ThemeStyle, useColorScheme, useTheme } from '../config/Theme';
import { useFileSystem } from './FileSystem';

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

interface iFileSearchMenuProps {
    height: number,
}

export default function FileSearchMenu(props: iFileSearchMenuProps) {

    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const fileSystem = useFileSystem();

    const handleSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    }

    const handleSubmit = async () => {
        const newResults = await fileSystem?.searchDirectory(searchTerm);
        if (newResults) {
            setResults([...newResults]);
        }
    }

    return (
        <Box height={props.height} padding="15px">
            <Stack direction="row">
                <StyledTextField 
                  id="outlined-basic" 
                  label="Enter search term" 
                  variant="outlined" 
                  size='small'
                  fullWidth={true}
                  onChange={handleSearchTermChange}
                />
                <IconButton 
                    onClick={handleSubmit}
                >
                    <Search sx={{ color: theme.text.color }}/>
                </IconButton>
            </Stack>
            <List>
                {results!.map((result, index) => (
                    <ListItemButton 
                        key={index}
                    >
                        <ListItemText 
                            sx={{color: theme.text.color}} 
                            primary={result}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}