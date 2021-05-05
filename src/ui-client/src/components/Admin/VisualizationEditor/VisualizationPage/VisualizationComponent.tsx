/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import { Col, Row } from 'reactstrap';
import { AdminVisualizationComponent } from '../../../../models/admin/Visualization';

interface Props { 
    data: AdminVisualizationComponent;
}

interface ErrorBoundaryState {
    errored: boolean;
}

export class VisualizationComponent extends React.Component<Props, ErrorBoundaryState> {
    constructor(props: Props) {
        super(props);
        this.state = { 
            errored: false
        };
    }

    public static getDerivedStateFromError(error: any) {
        return { errored: true };
    }
    
    public componentDidCatch(error: any, errorInfo: any) {    
        console.log(error, errorInfo);
    }

    public render() {
        if (this.state.errored) {
            return (
                <div className={`visualize-error`}>
                    <p>
                        Whoops! An error occurred while creating patient visualizations. We are sorry for the inconvenience. 
                        Please contact your Leaf administrator if this error continues.
                    </p>
                </div>
            );
        }

        return <VisualizationComponentInternal {...this.props} />;
    }
}

class VisualizationComponentInternal extends React.PureComponent<Props> {
    private className = 'visualization-component';

    public render() {
        const c = this.className;
        const { data } = this.props;

        const d = { "values": [
            {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
            {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
            {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
            ]
        }
        
        return (
            <div className={c}>
                <Row>
                    <Col md={data.isFullWidth ? 12 : 6}>
                        <div className={c}>
                            <VegaLite spec={data.jsonSpec as VisualizationSpec} data={d}/>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}