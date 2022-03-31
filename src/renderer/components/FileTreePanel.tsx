import React, { useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { treeItemClasses, TreeItemProps } from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useFileSystem, FileTreeItem } from './FileSystem';
import { ipcRenderer, Menu } from 'electron';
import TextField from '@mui/material/TextField';
import { ThemeStyle, useColorScheme, useTheme } from '../config/Theme';
import { TABS_HEIGHT } from './EditorPanel';

const StyledTreeItemRoot = styled(function CustomTreeItem(props: TreeItemProps & {item: FileTreeItem}) {
    return (
        <TreeItem 
            {...props}
            expandIcon={props.item.directory ? <ArrowRightIcon /> : null}
            collapseIcon={props.item.directory ? <ArrowDropDownIcon /> : null}
        />
    )
})(({ theme }) => {
    const customTheme = useTheme();
    const colorScheme = useColorScheme();

    return {
        color: theme.palette.text.secondary,
        [`& .${treeItemClasses.content}`]: {
            // color: theme.palette.text.secondary,
            color: customTheme.text.color,
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            paddingRight: theme.spacing(1),
            // fontWeight: theme.typography.fontWeightMedium,
            fontWeight: theme.typography.fontWeightRegular,
            '&.Mui-expanded': {
                fontWeight: theme.typography.fontWeightRegular,
            },
            '&:hover': {
                backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
                // backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
                backgroundColor: colorScheme === ThemeStyle.light ? 'lightgrey' : '#484848',
                // color: 'var(--tree-view-color)',
                color: customTheme.text.color
            },
            [`& .${treeItemClasses.label}`]: {
                fontWeight: 'inherit',
                color: 'inherit',
            },
        },
        [`& .${treeItemClasses.group}`]: {
            marginLeft: 0,
            [`& .${treeItemClasses.content}`]: {
                paddingLeft: theme.spacing(2),
            },
        },
    }
});

interface StyledTreeItemProps {
    item: FileTreeItem,
    children?: React.ReactNode,
}

function StyledTreeItem(props: StyledTreeItemProps) {
    const {
        item,
        children,
    } = props;

    const fileSystem = useFileSystem();
    const textFieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        window.addEventListener('click', async (event: MouseEvent) => {
            const node = event.target as Node;
            if (textFieldRef.current && !textFieldRef.current.contains(node)) {
                if (textFieldRef.current.value === '') {
                    fileSystem?.setCurrentRenamingTreeItem(null);
                } else {
                    await fileSystem?.renameTreeItem(textFieldRef.current.value);
                }
            }
        })
    }, [fileSystem?.currentRenamingTreeItem]);

    return (
        <StyledTreeItemRoot
            item={item}
            onClick={async () => {
                if (item.directory) {
                    if (!item.explored) {
                        await fileSystem?.exploreDirectory(item, false);
                    }
                } else {
                    const openPaths = fileSystem?.files.map((af) => af.path);
                    const openIdx = openPaths!.indexOf(item.path);

                    if (openIdx === -1) {
                        await fileSystem?.open(item);
                    } else {
                        fileSystem?.setCurrentFileIdx(openIdx);
                    }
                }
            }}
            onContextMenu={async (event: React.MouseEvent) => {
                await ipcRenderer.invoke('show-fx-context', item);
            }}
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 0.2, pr: 0 }}>
                    <Box component={item.directory ? FolderIcon : TextSnippetIcon} color="inherit" fontSize='16px' sx={{ mr: 1 }} />
                    {item.path === fileSystem?.currentRenamingTreeItem?.path ? (
                        <TextField 
                            variant="outlined"
                            size='small'
                            inputRef={textFieldRef}
                        />
                    ) : (
                        <Typography variant="body2" sx={{ fontWeight: 'inherit', fontSize: '14px', flexGrow: 1 }}>
                            {item.name}
                        </Typography>
                    )}
                </Box>
            }
            nodeId={item.path}
        >
            {children}
        </StyledTreeItemRoot>
    );
}

interface iFileTreePanelProps {
    height: number
}

export default function FileTreePanel(props: iFileTreePanelProps) {
    const fileSystem = useFileSystem();
    const theme = useTheme();

    function _treeBuilder(items: FileTreeItem[]) {
        return (
            <>
                {items.map((item, index) => (
                    <StyledTreeItem 
                        item={item}
                        key={index}
                    >
                        {_treeBuilder(item.children)}
                    </StyledTreeItem>
                ))}
            </>
        )
    }

    return (
        <div style={{
            backgroundColor: theme.colors.explorerBackground
        }}>
            <Box
                sx={{
                    height: TABS_HEIGHT
                }}
            />
            <TreeView
                sx={{ 
                    height: props.height - TABS_HEIGHT, 
                    flexGrow: 1, 
                    overflowY: 'auto' 
                }}
            >
                {_treeBuilder(fileSystem!.explorerTree)}
            </TreeView>
        </div>
    );
}