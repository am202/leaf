/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Dropdown, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { exampleText }  from './ExampleText';
import { AdminHelp } from '../Admin/AdminHelp';
import { setCurrentHelpPage } from '../../actions/helpPage';
import { adminHelpContentUnsaved, isAdminHelpContentNew, setAdminHelpContent, setCurrentAdminHelpContent } from '../../actions/admin/helpPage';
import { Content } from '../../components/Help/Content/Content';
import { Categories } from '../../components/Help/Categories/Categories';
import { HelpSearch } from '../../components/Help/Search/HelpSearch';
import { UserContext } from '../../models/Auth';
import { HelpPage } from '../../models/Help/Help';
import { AdminHelpContent, ContentRow } from '../../models/admin/Help';
import { AppState } from '../../models/state/AppState';
import { AdminHelpState } from '../../models/state/AdminState';
import { HelpPageState, HelpPageLoadState } from '../../models/state/HelpState';
import { generate as generateId } from 'shortid';
import './Help.css';

interface OwnProps { }

interface StateProps {
    helpPages: HelpPageState;
    user: UserContext;
    adminHelp: AdminHelpState;
}

interface DispatchProps {
    dispatch: any;
}

interface State {
    show: boolean;
    category: string;
    title: string;
}

type Props = StateProps & OwnProps & DispatchProps;

export class Help extends React.PureComponent<Props, State> {
    private className = "help-page";

    constructor(props: Props) {
        super(props);   
        this.state = {
            show: false,
            category: '',
            title: ''
        }
    }

    public render() {
        const c = this.className;
        const { dispatch, helpPages, user, adminHelp } = this.props;
        const { show, category, title } = this.state;
        
        if (adminHelp.state === HelpPageLoadState.LOADED) {
            return (
                <AdminHelp
                    dispatch={dispatch}    
                    content={adminHelp.content}
                    currentContent={adminHelp.currentContent}
                    currentPage={helpPages.currentSelectedPage}
                    isNew={adminHelp.isNew}
                    unsaved={adminHelp.unsaved}
                />
            );
        };

        if (helpPages.content.state === HelpPageLoadState.LOADED) {
            return (
                <div className={`${c}-content`}>
                    <Content
                        content={helpPages.content.content}
                        currentPage={helpPages.currentSelectedPage}
                        dispatch={dispatch}
                    />
                </div>
            );
        };

        return (
            <div className={c}>
                <div className={`${c}-display`}>
                    {user.isAdmin &&
                        <div>
                            <Dropdown className={`${c}-create-dropdown-container`} isOpen={show} toggle={this.handleShow}>
                                <DropdownToggle caret className="leaf-button-addnew">
                                    New Help Page
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <div className={`${c}-create-button-item`}>
                                        Title <Input value={title} onChange={this.handleTitleChange} />
                                    </div>
                                    <div className={`${c}-create-button-item`}>
                                        Category <Input value={category} onChange={this.handleCategoryChange} />
                                    </div>
                                    <div className={`${c}-create-button-item`}>
                                        <Button className="leaf-button-addnew" onClick={this.handleCreateNewPage}>
                                            <span>+ Create</span>
                                        </Button>
                                    </div>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    }

                    <HelpSearch />
                    
                    {(helpPages.state === HelpPageLoadState.LOADED) &&
                        <Categories
                            categories={helpPages.categories}
                            dispatch={dispatch}
                            isAdmin={user.isAdmin}
                            newCategory={category}
                            newTitle={title}
                        />
                    }
                </div>
            </div>
        );
    };

    private handleShow = () => {
        const { show } = this.state;
        this.setState({ show: !show, category: '', title: '' });
    };

    private handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        this.setState({ category: val });
    };

    private handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        this.setState({ title: val });
    };

    private handleCreateNewPage = () => {
        const { dispatch } = this.props;
        const { category, title, show } = this.state;
        const uniqueId = generateId();

        const contentRow = Object.assign({}, {
            id: uniqueId,
            pageId: '',
            orderId: 0,
            type: 'text',
            textContent: exampleText,
            imageId: '',
            imageContent: '',
            imageSize: 0
        }) as ContentRow;

        const newContent = Object.assign({}, {
            title: title ? title : ' Example Title',
            category: category ? category : 'Example Category',
            content: [ contentRow ]
        }) as AdminHelpContent;

        dispatch(setCurrentAdminHelpContent(newContent));
        dispatch(setAdminHelpContent(newContent, HelpPageLoadState.LOADED));
        dispatch(setCurrentHelpPage({ id: '', categoryId: '', title: '' } as HelpPage));
        dispatch(isAdminHelpContentNew(true));
        dispatch(adminHelpContentUnsaved(true));
        
        //  Clear the values so that when user clicks the "go back arrow" from content after clicking "+ Create", category/title are reset.
        this.setState({ show: !show, category: '', title: '' });
    };
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        helpPages: state.help,
        user: state.auth.userContext!,
        adminHelp: state.admin!.help
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return { dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(Help)