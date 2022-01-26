/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { showConfirmationModal } from '../../../actions/generalUi';
import { createAdminHelpPageContent, confirmLeavingAdminHelpContent,
        deleteHelpPageAndContent, resetAdminHelpContent, updateAdminHelpPageContent,
        isAdminHelpPageUnsaved, setCurrentAdminHelpPage } from '../../../actions/admin/helpPage';
import { AdminHelpPage, AdminHelpPageContent } from '../../../models/admin/Help';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { ContentRowEditor } from './Content/ContentRowEditor';
import { TextEditor } from './Content/TextEditor';
import { generate as generateId } from 'shortid';
import './HelpEditor.css';

import { Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Input } from 'reactstrap';
import { AdminHelpPageCategory, AdminHelpCategoryPageCache } from '../../../models/admin/Help';

interface Props {
    dispatch: any;
    page: AdminHelpPage;
    currentPage: AdminHelpPage;
    isNew: boolean;
    unsaved: boolean;

    categories: AdminHelpCategoryPageCache[];
}

interface State {
    category: string;
    show: boolean;
}

export class HelpEditor extends React.Component<Props, State> {
    private className = "help-editor"

    constructor(props: Props) {
        super(props);   
        this.state = {
            category: '',
            show: false
        }
    };

    public render() {
        const c = this.className;
        const { dispatch, categories, currentPage, unsaved } = this.props;
        const { category, show } = this.state;
        const isLastRow = this.isLastContentRow();

        const currentCategory = currentPage.category.name;

        return (
            <div className={c}>
                <Row className={`${c}-buttons`}>
                    <Col>
                        <IoIosArrowRoundBack
                            className={`${c}-back-arrow`}
                            onClick={this.handleContentGoBackClick}>
                        </IoIosArrowRoundBack>
                    </Col>

                    <Col>
                        <Button className={`${c}-edit-button`} color="secondary" disabled={!unsaved} onClick={this.handleUndoChanges}>
                            Undo Changes
                        </Button>

                        <Button className={`${c}-edit-button`} color="success" disabled={!unsaved} onClick={this.handleSaveChanges}>
                            Save
                        </Button>

                        <Button className={`${c}-edit-button`} color="danger" onClick={this.handleDeleteContent}>
                            Delete
                        </Button>
                    </Col>
                </Row>

                <div className={`${c}-content-text`}>
                    <TextEditor
                        text={currentPage.title}
                        textHandler={this.handleTitleChange}
                    />

                    {/*  */}
                    <Dropdown isOpen={show} toggle={this.handleShow}>
                        <DropdownToggle caret>
                            {currentCategory}
                        </DropdownToggle>
                        <DropdownMenu>
                            <div>
                                <Input value={category} placeholder='New Category' onChange={this.handleCategoryChange} />
                            </div>
                            
                            {categories.map((c, i) =>
                                <DropdownItem key={i} onClick={this.handleCategoryClick}>{c.name}</DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
                    {/*  */}

                    {currentPage.content.map((cr,i) =>
                        <ContentRowEditor
                            key={cr.id}
                            dispatch={dispatch}
                            contentRow={cr}
                            index={i}
                            isLastRow={isLastRow}
                            pageId={currentPage.id}
                            contentHandler={this.handleContentChange}
                            newSectionHandler={this.handleNewSection}
                            imageSizeHandler={this.handleImageSizeChange}
                            deleteRowHandler={this.handleDeleteRow}
                        />
                    )}
                </div>
            </div>
        );
    };

    private handleShow = () => {
        const { show } = this.state;
        this.setState({ show: !show, category: '' });
    };

    private handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        this.setState({ category: val });
        
        const { dispatch, currentPage } = this.props;
        
        const newCategory = { id: '', name: val } as AdminHelpPageCategory;
        const updatedPage = Object.assign({}, currentPage, { category: newCategory }) as AdminHelpPage;
        
        dispatch(setCurrentAdminHelpPage(updatedPage));
        dispatch(isAdminHelpPageUnsaved(true));
    };

    private handleCategoryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { dispatch, currentPage } = this.props;

        const category = e.currentTarget.textContent;
        const newCategory = { id: '', name: category } as AdminHelpPageCategory;
        const updatedPage = Object.assign({}, currentPage, { category: newCategory }) as AdminHelpPage;
        
        dispatch(setCurrentAdminHelpPage(updatedPage));
        dispatch(isAdminHelpPageUnsaved(true));
    };

    // // // // // // // // // // //

    private isLastContentRow = (): boolean => {
        const { currentPage } = this.props;
        const contentLength = currentPage.content.length;
        
        if (contentLength === 1) { return true };
        
        return false;
    };

    private handleTitleChange = (val: string) => {
        const { dispatch, currentPage } = this.props;
        const updatedPage = Object.assign({}, currentPage, { title: val }) as AdminHelpPage;
        
        dispatch(setCurrentAdminHelpPage(updatedPage));
        dispatch(isAdminHelpPageUnsaved(true));
    };

    private handleContentChange = (val: string, index: number) => {
        const { dispatch, currentPage } = this.props;
        // Make copy of current content to edit
        const contentCopy = currentPage.content.slice();

        // TODO: dont feel comfortable with filter, is there a better way?
        const textContentRows = contentCopy.filter(c => c.type === "text").length;

        // Find content row via index to edit
        const contentRow = contentCopy.find((_, i) => i === index);

        if (val) {
            const updatedContentRow = Object.assign({}, contentRow, { textContent: val }) as AdminHelpPageContent;
            contentCopy.splice(index, 1, updatedContentRow);
        } else if (!val && textContentRows === 1) {
            const updatedContentRow = Object.assign({}, contentRow, { textContent: '' }) as AdminHelpPageContent;
            contentCopy.splice(index, 1, updatedContentRow);
        } else {
            contentCopy.splice(index, 1);
        };

        const updatedPage = Object.assign({}, currentPage, { content: contentCopy }) as AdminHelpPage;
        dispatch(setCurrentAdminHelpPage(updatedPage));

        dispatch(isAdminHelpPageUnsaved(true));
    };

    private handleImageSizeChange = (val: number, index: number) => {
        const { dispatch, currentPage } = this.props;
        // Make copy of current content to edit
        const contentCopy = currentPage.content.slice();
        // Find content row via index to edit
        const contentRow = contentCopy.find((_, i) => i === index);
        const isLastContentRow = this.isLastContentRow();

        if (val) {
            const updatedContentRow = Object.assign({}, contentRow, { imageSize: val }) as AdminHelpPageContent;
            contentCopy.splice(index, 1, updatedContentRow);
        } else if (!val && !isLastContentRow) {
            contentCopy.splice(index, 1)
        }

        const updatedPage = Object.assign({}, currentPage, { content: contentCopy }) as AdminHelpPage;
        dispatch(setCurrentAdminHelpPage(updatedPage));

        dispatch(isAdminHelpPageUnsaved(true));
    };

    private handleDeleteRow = (index: number) => {
        const { dispatch, currentPage } = this.props;
        const contentCopy = currentPage.content.slice();
        
        contentCopy.splice(index, 1);
        dispatch(isAdminHelpPageUnsaved(true));

        const updatedPage = Object.assign({}, currentPage, { content: contentCopy }) as AdminHelpPage;
        dispatch(setCurrentAdminHelpPage(updatedPage));
    };

    private handleUndoChanges = () => {
        const { dispatch, page, isNew, unsaved } = this.props;

        if (isNew && unsaved) {
            dispatch(confirmLeavingAdminHelpContent());
        } else {
            dispatch(setCurrentAdminHelpPage(page));
            dispatch(isAdminHelpPageUnsaved(false));
        };
    };

    private handleSaveChanges = () => {
        const { dispatch, currentPage, isNew } = this.props;

        if (isNew) {
            dispatch(createAdminHelpPageContent(currentPage));
        } else {
            dispatch(updateAdminHelpPageContent(currentPage));
        };
    };

    private handleContentGoBackClick = () => {
        const { dispatch, unsaved } = this.props;
        unsaved ? dispatch(confirmLeavingAdminHelpContent()) : dispatch(resetAdminHelpContent());
    };

    private handleDeleteContent = () => {
        const { dispatch, currentPage, isNew } = this.props;

        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the page, "${currentPage.title}"? This will take effect immediately and can't be undone.`,
            header: 'Delete Page',
            onClickNo: () => null,
            onClickYes: () => {
                isNew
                    ? dispatch(resetAdminHelpContent())
                    : dispatch(deleteHelpPageAndContent(currentPage.id, currentPage.title));
            },
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Page`
        };
        dispatch(showConfirmationModal(confirm));
    };

    private handleNewSection = (index: number, isTypeText: boolean, e?: React.ChangeEvent<HTMLInputElement>) => {    
        const { dispatch, currentPage } = this.props;
        const uniqueId = generateId();
        // Make copy of current content to edit
        const contentCopy = currentPage.content.slice();
        const isLastContentRow = this.isLastContentRow();
        const isLastTextRowEmpty: boolean = (!contentCopy[0].textContent && contentCopy[0].type.toLowerCase() === "text");
        
        // If last text row is empty, then delete empty text row and insert new section in the deleted position.
        if (isLastContentRow && isLastTextRowEmpty) {
            contentCopy.splice(0, 1);
        };

        if (isTypeText) {
            const con = Object.assign({}, {
                id: uniqueId,
                orderId: 0,
                type: 'text',
                textContent: 'New Section Added.',
                imageId: '',
                imageContent: '',
                imageSize: 0
            }) as AdminHelpPageContent;

            // Add new text section at index
            contentCopy.splice(index, 0, con);
            // Order the content rows by their index
            contentCopy.forEach((c,i) => c.orderId = i);
            
            const updatedPage = Object.assign({}, currentPage, { content: contentCopy }) as AdminHelpPage;
            dispatch(setCurrentAdminHelpPage(updatedPage));
        } else {
            const image = e!.currentTarget.files!.item(0)!;
            const imageId = image.name;
            const reader = new FileReader();
            reader.readAsDataURL(image);

            reader.onload = () => {
                const imageString = reader.result!.toString().split(',')[1];
                const con = Object.assign({}, {
                    id: uniqueId,
                    orderId: 0,
                    type: 'image',
                    textContent: '',
                    imageId: imageId,
                    imageContent: imageString,
                    imageSize: 50 // Set initial image size to 50%.
                }) as AdminHelpPageContent;

                // Add new image section at index
                contentCopy.splice(index, 0, con);
                // Order the content rows by their index
                contentCopy.forEach((c,i) => c.orderId = i);

                const updatedPage = Object.assign({}, currentPage, { content: contentCopy }) as AdminHelpPage;
                dispatch(setCurrentAdminHelpPage(updatedPage));
            };
            
            // Removes input value so that onChange function runs again.
            // Otherwise, nothing happens on onChange because value exists.
            e!.currentTarget.value = '';
        };
        dispatch(isAdminHelpPageUnsaved(true));
    };
}