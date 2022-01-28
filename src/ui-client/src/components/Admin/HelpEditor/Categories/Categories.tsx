/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row, Col } from 'reactstrap';
import { AdminHelpCategoryPageCache, PartialAdminHelpPage } from '../../../../models/admin/Help';
import { Pages } from '../Pages/Pages';
import './Categories.css';

interface Props {
    categories: AdminHelpCategoryPageCache[];
    newCategory: string;
    newTitle: string;
    dispatch: any;
}

export class Categories extends React.Component<Props> {
    private className = "admin-categories";

    public render() {
        const c = this.className;
        const { categories, dispatch, newCategory, newTitle } = this.props;
        // Filter categories to get only categories that have pages.
        const newCatsList = categories.filter(c => c.pages.length);
        // Filter from all categories including categories without pages.
        // Getting first value from filter array since there should only be one match.
        const existingCat = categories.filter(c => c.name.toLowerCase() === newCategory.toLowerCase())[0];
        let tempCatId = '';
        if (existingCat) {
            tempCatId = existingCat.id;
            newCatsList.push(existingCat);
        };
        const tempPage = { id: '', categoryId: tempCatId, title: newTitle } as PartialAdminHelpPage;

        return (
            <Row className={c}>
                {newCatsList.map(c =>
                    <Pages
                        key={c.id}
                        category={c}
                        tempHelpPage={tempPage}
                        dispatch={dispatch}

                        categories={categories}
                    />
                )}
                
                {(newCategory && !tempCatId) &&
                    <Col>
                        <div><b>{newCategory.toUpperCase()}</b></div>
                        <div style={{color: "#FF0000"}}>{newTitle}</div>
                    </Col>
                }
            </Row>
        );
    };
};