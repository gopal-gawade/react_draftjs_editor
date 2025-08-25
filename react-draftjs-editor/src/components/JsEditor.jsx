import { useState } from "react";
import {
    Editor,
    EditorState,
    RichUtils,
    SelectionState,
    Modifier,
    convertToRaw,
    convertFromRaw,
} from "draft-js";
import _ from "lodash";

const JsEditor = () => {
    const storeRaw = localStorage.getItem("draftRaw");
    const [editorState, setEditorState] = useState(() =>
        storeRaw
            ? EditorState.createWithContent(convertFromRaw(JSON.parse(storeRaw)))
            : EditorState.createEmpty()
    );

    const findWithRegex = (regex, contentBlock, callback) => {
        const text = contentBlock.getText();
        let matchArr, start, end;
        while ((matchArr = regex.exec(text)) !== null) {
            start = matchArr.index;
            end = start + matchArr[0].length;
            callback(start, end);
        }
    };

    const styles = ["BOLD", "ITALIC", "UNDERLINE", "STRIKETHROUGH", "CODE"];

    const styleMap = {
        COLOR_RED: {
            color: "#FF0000",
        },
        COLOR_BLACK: {
            color: "#000000",
        },
    };

    const clearInlineStyles = () => {
        const contentWithoutStyles = _.reduce(
            styles,
            (newContentState, style) =>
                Modifier.removeInlineStyle(
                    newContentState,
                    editorState.getSelection(),
                    style
                ),
            editorState.getCurrentContent()
        );

        const newStateWithoutStyles = EditorState.push(
            editorState,
            contentWithoutStyles
        );

        const newState = RichUtils.toggleBlockType(
            newStateWithoutStyles,
            "unstyled"
        );
        setEditorState(RichUtils.toggleInlineStyle(newState, "COLOR_BLACK"));
    };

    const saveData = () => {
        var contentRaw = convertToRaw(editorState.getCurrentContent());
        localStorage.setItem("draftRaw", JSON.stringify(contentRaw));
    };

    return (
        <div className="flex flex-col items-center justify-center p-3 text-sm sm:text-md">
            <div className="text-center my-2">
                <h4 className="text-lg font-semibold text-gray-900">
                    Demo editor by Gopal
                </h4>
            </div>

            <div className="my-2 flex gap-2">
                <button
                    className="bg-white cursor-pointer border border-gray-200 rounded-xl px-4 py-2 text-blue-600 font-medium shadow-sm hover:bg-gray-100 active:scale-95 transition-all"
                    onClick={saveData}
                >
                    Save
                </button>

                <button
                    className="bg-white cursor-pointer border border-gray-200 rounded-xl px-4 py-2 text-red-500 font-medium shadow-sm hover:bg-gray-100 active:scale-95 transition-all"
                    onClick={clearInlineStyles}
                >
                    Remove Style
                </button>
            </div>

            <div className="w-full my-2">
                <Editor
                    editorState={editorState}
                    customStyleMap={styleMap}
                    onChange={(editorState) => {
                        setEditorState(editorState);
                        const textnew = editorState
                            .getCurrentContent()
                            .getPlainText("\u0001");

                        const selectionsToReplace = [];
                        const blockMap = editorState.getCurrentContent().getBlockMap();

                        let regex;
                        if (textnew.substring(textnew.length - 2) === "# ") {
                            regex = new RegExp(`# `, "g");
                            blockMap.forEach((contentBlock) =>
                                findWithRegex(regex, contentBlock, (start, end) => {
                                    const blockKey = contentBlock.getKey();
                                    const blockSelection = SelectionState.createEmpty(
                                        blockKey
                                    ).merge({
                                        anchorOffset: start,
                                        focusOffset: end,
                                    });
                                    selectionsToReplace.push(blockSelection);
                                })
                            );
                        } else if (/\w*(?<!\*)\*[\s]/g.test(textnew)) {
                            regex = /\w*(?<!\*)\*[\s]/g;
                            blockMap.forEach((contentBlock) =>
                                findWithRegex(regex, contentBlock, (start, end) => {
                                    const blockKey = contentBlock.getKey();
                                    const blockSelection = SelectionState.createEmpty(
                                        blockKey
                                    ).merge({
                                        anchorOffset: start,
                                        focusOffset: end,
                                    });
                                    selectionsToReplace.push(blockSelection);
                                })
                            );
                        } else if (/\w*(?<!\*)\*\*[\s]/g.test(textnew)) {
                            regex = /\w*(?<!\*)\*\*[\s]/g;
                            blockMap.forEach((contentBlock) =>
                                findWithRegex(regex, contentBlock, (start, end) => {
                                    const blockKey = contentBlock.getKey();
                                    const blockSelection = SelectionState.createEmpty(
                                        blockKey
                                    ).merge({
                                        anchorOffset: start,
                                        focusOffset: end,
                                    });
                                    selectionsToReplace.push(blockSelection);
                                })
                            );
                        } else if (/\w*(?<!\*)\*\*\*[\s]/g.test(textnew)) {
                            regex = /\w*(?<!\*)\*\*\*[\s]/g;
                            blockMap.forEach((contentBlock) =>
                                findWithRegex(regex, contentBlock, (start, end) => {
                                    const blockKey = contentBlock.getKey();
                                    const blockSelection = SelectionState.createEmpty(
                                        blockKey
                                    ).merge({
                                        anchorOffset: start,
                                        focusOffset: end,
                                    });
                                    selectionsToReplace.push(blockSelection);
                                })
                            );
                        }
                        let contentState = editorState.getCurrentContent();

                        selectionsToReplace.forEach((selectionState) => {
                            contentState = Modifier.replaceText(
                                contentState,
                                selectionState,
                                ""
                            );
                        });

                        const newState = EditorState.push(editorState, contentState);
                        const newStateUnstyled = RichUtils.toggleBlockType(
                            newState,
                            "unstyled"
                        );
                        const newStateMFTE = EditorState.moveFocusToEnd(newStateUnstyled);

                        if (textnew.substring(textnew.length - 2) === "# ") {
                            const newStateHeader = RichUtils.toggleBlockType(
                                newStateMFTE,
                                "header-one"
                            );
                            setEditorState(
                                RichUtils.toggleInlineStyle(newStateHeader, "COLOR_BLACK")
                            );
                        } else if (/\w*(?<!\*)\*[\s]/g.test(textnew)) {
                            const newStateBold = RichUtils.toggleInlineStyle(
                                newStateMFTE,
                                "BOLD"
                            );
                            setEditorState(
                                RichUtils.toggleInlineStyle(newStateBold, "COLOR_BLACK")
                            );
                        } else if (/\w*(?<!\*)\*\*[\s]/g.test(textnew)) {
                            setEditorState(
                                RichUtils.toggleInlineStyle(newStateMFTE, "COLOR_RED")
                            );
                        } else if (/\w*(?<!\*)\*\*\*[\s]/g.test(textnew)) {
                            const newStateUnderline = RichUtils.toggleInlineStyle(
                                newStateMFTE,
                                "UNDERLINE"
                            );
                            setEditorState(
                                RichUtils.toggleInlineStyle(newStateUnderline, "COLOR_BLACK")
                            );
                        }
                    }}
                    placeholder="Write Here"
                />
            </div>

            <div className="max-w-md mx-auto my-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                    <h4 className="text-gray-900 text-lg font-semibold">Instructions</h4>
                </div>

                <ul className="divide-y divide-gray-200">
                    <li className="px-4 py-3 text-gray-700">
                        <span className="font-medium text-blue-600"># + space</span> →
                        Header
                    </li>
                    <li className="px-4 py-3 text-gray-700">
                        <span className="font-medium text-blue-600">* + space</span> → Bold
                    </li>
                    <li className="px-4 py-3 text-gray-700">
                        <span className="font-medium text-blue-600">** + space</span> → Red
                        Line
                    </li>
                    <li className="px-4 py-3 text-gray-700">
                        <span className="font-medium text-blue-600">*** + space</span> →
                        Underline
                    </li>
                    <li className="px-4 py-3 text-gray-700">
                        <span className="font-medium text-green-600">Save</span> → To save
                        text
                    </li>
                    <li className="px-4 py-3 text-gray-700">
                        <span className="font-medium text-red-600">Remove Styles</span> → To
                        remove inline styles
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default JsEditor;
