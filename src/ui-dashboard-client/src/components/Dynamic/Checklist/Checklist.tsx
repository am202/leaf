import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { WidgetChecklistConfig, ContentChecklistDatasetConfig } from '../../../models/config/content';
import { CohortData, PatientData } from '../../../models/state/CohortState';
import { getDynamicColor, getDynamicIcon } from '../../../utils/dynamic';
import DynamicChecklistItem from './ChecklistItem';
import { getDatasetMetadataColumns } from '../../../utils/datasetMetadata';
import './Checklist.css';

interface Props {
    config: WidgetChecklistConfig;
    cohort: CohortData;
    patient: PatientData;
    dispatch: any;
}

interface State {
    selectedDatasetConfig?: ContentChecklistDatasetConfig;
}

export default class DynamicChecklist extends React.Component<Props, State> {
    private className = 'dynamic-checklist';
    public constructor(props: Props) {
        super(props);
        this.state = {
            selectedDatasetConfig: props.config.datasets.length
                ? props.config.datasets[0]
                : undefined
        }
    }

    /**
     * Render
     */
    public render() {
        const { config } = this.props;
        const c = this.className;

        return (
            <Container className={`${c}-container`} style={{ width: `${config.width ?? settings.defaultWidth}%` }}>
                {this.getTitle(config)}
                <Row className={`${c}-inner`} style={this.getStyle(config)}>

                    {/* Left column */}
                    <Col md={5} className={`${c}-inner-left`}>
                        {this.getDatasetsSelector(config)}
                    </Col>

                    {/* Right column */}
                    <Col md={7} className={`${c}-inner-right`}>
                        {this.getChecklistItems()}
                    </Col>
                </Row>
            </Container>
        );
    }

    /**
     * Get style for main checklist element
     */
    private getStyle = (config: WidgetChecklistConfig): React.CSSProperties => {
        return {
            backgroundColor: getDynamicColor(config.color, settings.background.transparency),
            border: `${settings.border.size}px solid ${getDynamicColor(config.color, settings.border.transparency)}`
        };
    }

    /**
     * Get title of the checklist
     */
    private getTitle = (config: WidgetChecklistConfig): JSX.Element => {
        const c = this.className;
        return (
            <div className={`${c}-title-container`} style={{ backgroundColor: getDynamicColor(config.color, settings.title.transparency) }}>
                {getDynamicIcon(config.icon)}
                <span className={`${c}-title`}>{config.title}</span>
            </div>
        )
    }

    /**
     * Get list of available sub-checklists (ie, datasets) in checklist
     */
    private getDatasetsSelector = (config: WidgetChecklistConfig): JSX.Element | null => {
        const { selectedDatasetConfig } = this.state;
        const c = this.className;

        if (!selectedDatasetConfig) { return null; }

        return (
            <div className={`${c}-dataset-selector-container`}>
                {config.datasets.map(ds => {
                    const color = getDynamicColor(config.color);
                    return (
                        <div key={ds.id}>
                            <span 
                                className={`${c}-dataset-selector ${ds === selectedDatasetConfig ? 'selected' : ''}`}
                                style={{ borderLeftColor: color, color }}
                                >
                                {ds.title}
                            </span>
                        </div>
                )})}
            </div>
        )
    }

    /**
     * Get checklist items for currently selected checklist
     */
    private getChecklistItems = (): JSX.Element | null => {
        const { patient, cohort } = this.props;
        const { selectedDatasetConfig } = this.state;
        const className = `${this.className}-item-container`;
        
        if (!selectedDatasetConfig || !patient.datasets.has(selectedDatasetConfig.id)) { return null; }

        const { items } = selectedDatasetConfig;
        const meta = cohort.metadata.get(selectedDatasetConfig.id);
        const data = patient.datasets.get(selectedDatasetConfig.id);
        const cols = getDatasetMetadataColumns(meta!);

        // 2 columns if more than 5 elements
        if (items.length > 5) {
            const left = items.slice(0, items.length / 2);
            const right = items.slice(items.length / 2);

            return (
                <Row className={className}>
                    <Col md={6}>
                        {left.map((item, i) => {
                            return <DynamicChecklistItem key={i} data={data} cols={cols} name={item} />
                        })}
                    </Col>
                    <Col md={6}>
                        {right.map((item, i) => {
                            return <DynamicChecklistItem key={i} data={data} cols={cols} name={item} />
                        })}
                    </Col>
                </Row>
            );
        } 
        // Else 1 column
        else {
            return (
                <div className={className}>
                    {selectedDatasetConfig.items.map((item, i) => {
                        return <DynamicChecklistItem key={i} data={data} cols={cols} name={item} />
                    })}
                </div>
            )
        }
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
        transparency: 0.15
    }
};