/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Col } from 'reactstrap';
import { getAdminHelpPageContent } from '../../../../actions/admin/helpPage';
import { AdminHelpCategoryPageCache, PartialAdminHelpPage } from '../../../../models/admin/Help';
import './Pages.css';

interface Props {
    currentCategory: AdminHelpCategoryPageCache;
    tempPartialHelpPage: PartialAdminHelpPage;
    dispatch: any;
}

interface State {
    show: boolean;
}

export class Pages extends React.Component<Props, State> {
    private className = "admin-pages"

    constructor(props: Props) {
        super(props);
        this.state = {
            show: false
        };
    };

    public render() {
        const c = this.className;
        const { currentCategory, tempPartialHelpPage } = this.props;
        const { show } = this.state;

        const partialPages = currentCategory.partialPages;
        const numberOfPages = partialPages.length;
        const numberOfPagesGreaterThanFive = (numberOfPages > 5) ? true : false;
        const start = 0;
        const defaultEnd = 5; // Maximum of 5 help pages will show by default.
        const end = show ? numberOfPages : defaultEnd;
        const slicedPartialPages = partialPages.slice(start, end);

        return (
            <Col className={c} xs="4">
                <div className={`${c}-category`}>
                    <b>{currentCategory.name.toUpperCase()}</b>
                </div>

                {currentCategory.id === tempPartialHelpPage.categoryId && <div style={{color: "#FF0000"}}>{tempPartialHelpPage.title}</div>}

                {slicedPartialPages.map(p =>
                    <div key={p.id} className={`${c}-page`}>
                        <Button color="link" onClick={this.handleHelpPageTitleClick.bind(null, p)}>
                            {p.title}
                        </Button>
                    </div>
                )}

                <div className={`${c}-show-all`}>
                    <Button color="link" onClick={this.handleSeeAllPagesClick}>
                        {numberOfPagesGreaterThanFive &&
                            (show
                                ? <span>Less ...</span>
                                : <span>See all {numberOfPages} pages</span>
                            )
                        }
                    </Button>
                </div>
            </Col>
        );
    };

    private handleSeeAllPagesClick = () => {
        this.setState(prevState => ({ show: !prevState.show }));
    };

    private handleHelpPageTitleClick = (page: PartialAdminHelpPage) => {
        const { currentCategory, dispatch } = this.props;
        dispatch(getAdminHelpPageContent(page, currentCategory));
    };
};