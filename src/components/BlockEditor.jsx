import React, { useState } from 'react'
import { Map } from 'immutable'
import { stateToHTML } from 'draft-js-export-html';

import { Editor, EditorState, convertToRaw, DefaultDraftBlockRenderMap, RichUtils, EditorBlock } from 'draft-js';
import { Card, Button } from 'antd';

function MyCustomBlock(props) {

  const { block, blockProps } = props;
  const { toHeader, toList, toParagraph, } = blockProps

  const onUpdate = () => {
  }
  return (
    <Card>
      <Button contentEditable={false} onClick={toHeader}>H1</Button>
      <Button contentEditable={false} onClick={toList}>H1</Button>
      <Button contentEditable={false} onClick={toParagraph}>H1</Button>
      <EditorBlock {...props} />

    </Card>
  )
}
const Wrapper = (props) => {
  // console.log(props)
  const {toHeader} = props.xxx
  // console.log(saveData)
  return (
    <Card>
      <Button contentEditable={false} onClick={toHeader}>H1</Button>
      {props.children}
    </Card>
  )
}
export default function BlockEditor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())

  const onChange = (editorState) => {
    setEditorState(editorState)
  }

  const toHeader = () => {
    onChange(RichUtils.toggleBlockType(editorState, 'header-one'))
  }

  const toList = () => {
    onChange(RichUtils.toggleBlockType(editorState, 'unordered-list-item'))
  }
  const toParagraph = () => {
    onChange(RichUtils.toggleBlockType(editorState, 'unstyled'))
  }

  const saveData = () => {
    let html = stateToHTML(editorState.getCurrentContent())
    console.log(html)
  }

  function blockRendererFn(contentBlock) {
    const type = contentBlock.getType();
    switch (type) {
      case 'unstyled':
        return {
          component: MyCustomBlock,
          props: {
            toHeader,
            toList,
            toParagraph,
          }
        };
      // case 'sdfdfsf':
      //   return {
      //     component: MyCustomBlock,
      //     props: {
      //       toHeader,
      //       toList,
      //       toParagraph,
      //     }
      //   };
      default:
        return null;
    }

  }
  

  const blockRenderMap = DefaultDraftBlockRenderMap.merge(Map({
    'header-one': {
      element: 'h2',
      wrapper: <Wrapper xxx={{toHeader}}/>
    },
    'unstyled': {
      element: 'h4',
      wrapper: <Wrapper xxx={{toHeader}}/>
    },
    // 'paragraph': {
    //   element: 'span',
    // },
  }))
  // const blockRenderMap2 = DefaultDraftBlockRenderMap.merge(blockRenderMap)
  return (
    <Card>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        blockRenderMap={blockRenderMap}
        blockRendererFn={blockRendererFn}

      />
      <Button onClick={saveData}>保存</Button>
      <Card><div dangerouslySetInnerHTML={{
        __html: stateToHTML(editorState.getCurrentContent())
      }} /></Card>

    </Card>
  );
}
