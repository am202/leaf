import moment from 'moment';
import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import { WidgetListConfig } from '../../../models/config/content';
import { CohortData, PatientData } from '../../../models/state/CohortState';
import { getDatasetMetadataColumns } from '../../../utils/datasetMetadata';
import { getDynamicColor, getDynamicIcon } from '../../../utils/dynamic';
import './List.css';

interface Props {
    config: WidgetListConfig;
    cohort: CohortData;
    patient: PatientData;
    dispatch: any;
}

export default class DynamicList extends React.Component<Props> {
    private className = 'dynamic-list';

    /**
     * Render
     */
    public render() {
        const { config, cohort } = this.props;
        const c = this.className;
        const meta = cohort.metadata.get(config.datasetId);

        if (!meta) { return null; }

        return (
            <Container className={`${c}-container`} style={{ "width": `${config.width ?? settings.defaultWidth}%`, color: this.getStyle().color }}>
                {this.getTitle()}

                <div className={`${c}-inner`} style={this.getStyle()}>
                    <div className={`${c}-inner-background`}>
                        {this.getItems()}
                    </div>
                </div>
            </Container>
        );
    }

    /**
     * Get style for main checklist element
     */
     private getStyle = (): React.CSSProperties => {
        const { config } = this.props;
        return {
            backgroundColor: getDynamicColor(config.color, settings.background.transparency),
            border: `${settings.border.size}px solid ${getDynamicColor(config.color, settings.border.transparency)}`
        };
    }

    /**
     * Get title of the list
     */
    private getTitle = (): JSX.Element => {
        const { config } = this.props;
        const c = this.className;
        return (
            <div className={`${c}-title-container`} style={{ backgroundColor: getDynamicColor(config.color, settings.title.transparency) }}>
                {getDynamicIcon(config.icon)}
                <span className={`${c}-title`}>{config.title}</span>
            </div>
        )
    }

    /**
     * Get items
     */
    private getItems = (): JSX.Element | null => {
        const { config, cohort, patient } = this.props;
        const meta = cohort.metadata.get(config.datasetId);
        let data = patient.datasets.get(config.datasetId);
        const c = this.className;

        if (!meta || !data || (data.length == 0)) { return null; }

        const cols = getDatasetMetadataColumns(meta!);
        const containerClass = `${c}-item-container`;
        const valClass = `${c}-item-value`;
        const dateClass = `${c}-item-value-more`;
        const valMoreClass = `${c}-item-value-more`;
        const datediffClass = `${c}-item-datediff`;
        const parenClass = `${c}-item-paren`;

        const firstDate = (data[0][cols.fieldDate!] as any) as Date;
        const lastDate = (data[data.length - 1][cols.fieldDate!] as any) as Date;
        if (firstDate && lastDate && (firstDate.getTime() < lastDate.getTime())) {
            data = data.reverse();
        }
        
        const firstVal = data[0][cols.fieldValueString!];
        const extraColumn = (firstVal && (firstVal.indexOf("|||") >= 0));
        let endDateColumn = false;
        if (extraColumn) {
            const firstVal2 = firstVal.substring(firstVal.indexOf("|||") + 3);
            if (firstVal2.startsWith("endDate:")) {
                endDateColumn = true;
            }
        }

        return (
            <div>
                {data.map((d, i) => {
                    const val = d[cols.fieldValueString!];
                    const date = (d[cols.fieldDate!] as any) as Date;
                    let dateStr = '';
                    let diffStr = '';

                    if (date) {
                        const now = moment(new Date());
                        const then = moment(date);
                        dateStr = then.format('MM-DD-YYYY');

                        for (const pair of [['years','yr'],['months','mo'],['days','dy']]) {
                            const [ unit, abbr ] = pair;
                            const diff = now.diff(then, unit as any);
                            if (diff >= 1) {
                                diffStr = `${diff} ${abbr}`;
                                break;
                            }
                        }
                    }
                    
                    if (endDateColumn) {
                        const delim = val.indexOf("|||");
                        let val1 = '';
                        let val2 = '';
                        if (delim < 0) {
                            val1 = val;
                        } else {
                            val1 = val.substring(0, delim);
                            val2 = val.substring(delim + 3);
                            if (val2.startsWith("endDate:")) {
                                val2 = val2.substring(8);
                            }
                        }
                        const delim2 = val1.indexOf(":::");
                        if (delim2 >= 0) {
                            const val1a = val1.substring(0, delim2);
                            const val1b = val1.substring(delim2 + 3);
                            return (
                                <Row key={i} className={containerClass}>
                                    <Col className={valClass} md={4}>
                                        <span>{val1a}</span>
                                    </Col>
                                    <Col className={valMoreClass} md={4}>
                                        <span>{val1b}</span>
                                    </Col>
                                    <Col className={dateClass} md={2}>
                                        <span>{dateStr}</span>
                                    </Col>
                                    <Col className={dateClass} md={2}>
                                        <span>{val2}</span>
                                    </Col>
                                </Row>
                            );
                        }
                        return (
                            <Row key={i} className={containerClass}>
                                <Col className={valClass} md={8}>
                                    <span>{val1}</span>
                                </Col>
                                <Col className={dateClass} md={2}>
                                    <span>{dateStr}</span>
                                </Col>
                                <Col className={dateClass} md={2}>
                                    <span>{val2}</span>
                                </Col>
                            </Row>
                        );
                    } else if (extraColumn) {
                        const delim = val.indexOf("|||");
                        let val1 = '';
                        let val2 = '';
                        if (delim < 0) {
                            val1 = val;
                        } else {
                            val1 = val.substring(0, delim);
                            val2 = val.substring(delim + 3);
                        }
                        const delim2 = val1.indexOf(":::");
                        if (delim2 >= 0) {
                            const val1a = val1.substring(0, delim2);
                            const val1b = val1.substring(delim2 + 3);
                            return (
                                <Row key={i} className={containerClass}>
                                    <Col className={valClass} md={3}>
                                        <span>{val1a}</span>
                                    </Col>
                                    <Col className={valMoreClass} md={4}>
                                        <span>{val1b}</span>
                                    </Col>
                                    <Col className={valMoreClass} md={3}>
                                        <span>{val2}</span>
                                    </Col>
                                    <Col className={dateClass} md={2}>
                                        <span>{dateStr}</span>
                                    </Col>
                                </Row>
                            );
                        }
                        return (
                            <Row key={i} className={containerClass}>
                                <Col className={valClass} md={4}>
                                    <span>{val1}</span>
                                </Col>
                                <Col className={valMoreClass} md={5}>
                                    <span>{val2}</span>
                                </Col>
                                <Col className={dateClass} md={3}>
                                    <span>{dateStr}</span>
                                </Col>
                            </Row>
                        );
                    }
                    
                    return (
                        <Row key={i} className={containerClass}>
                            <Col className={valClass} md={8}>
                                <span>{val}</span>
                            </Col>
                            <Col className={dateClass} md={4}>
                                <span>{dateStr}</span>
                            </Col>
                        </Row>
                    );
                })}
            </div>
        );
    }
};

const settings = {
    background: {
        transparency: 0.05
    },
    border: {
        size: 1,
        transparency: 0.3,
    },
    defaultWidth: 100,
    title: {
        transparency: 0.1
    }
};
