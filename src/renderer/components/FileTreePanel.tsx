import React from 'react';
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

const StyledTreeItemRoot = styled(function CustomTreeItem(props: TreeItemProps & {item: FileTreeItem}) {
    return (
        <TreeItem 
            {...props}
            expandIcon={props.item.directory ? <ArrowRightIcon /> : null}
            collapseIcon={props.item.directory ? <ArrowDropDownIcon /> : null}
        />
    )
})(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&.Mui-expanded': {
      fontWeight: theme.typography.fontWeightRegular,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: 'var(--tree-view-color)',
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
}));

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
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
                    <Box component={item.directory ? FolderIcon : TextSnippetIcon} color="inherit" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                        {item.name}
                    </Typography>
                </Box>
            }
            nodeId={item.path}
        >
            {children}
        </StyledTreeItemRoot>
    );
}

export default function FileTreePanel() {
    const fileSystem = useFileSystem();

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
        <>
            <Box
                sx={{
                    height: '50px'
                }}
            />
            <TreeView
                sx={{ 
                    height: 264, 
                    flexGrow: 1, 
                    overflowY: 'auto' 
                }}
            >
                {_treeBuilder(fileSystem!.explorerTree)}
            </TreeView>
        </>
    );
}