import React from "react";
import DynamicChecklist from "../components/Dynamic/Checklist/Checklist";
import DynamicList from "../components/Dynamic/List/List";
import DynamicRow from "../components/Dynamic/Row/Row";
import DynamicTimeline from "../components/Dynamic/Timeline/Timeline";
import { WidgetChecklistConfig, WidgetListConfig, WidgetRowConfig, WidgetTimelineConfig, WidgetType, Icons } from "../models/config/content";
import { CohortData, PatientData } from "../models/state/CohortState";
import { RgbValues } from "../models/config/content";
import { VscChecklist } from "react-icons/vsc";
import { FiPlus } from "react-icons/fi";
import { GiMedicines } from "react-icons/gi";

export const renderDynamicComponent = (
        content: WidgetType, 
        cohort: CohortData,
        patient: PatientData,
        dispatch: any,
        key?: string | number)
    : JSX.Element | null => {
        const props = { cohort, patient, dispatch };
    switch (content.type) {
        case "row":       return <DynamicRow       key={key} config={content as WidgetRowConfig}       {...props} />;
        case "list":      return <DynamicList      key={key} config={content as WidgetListConfig}      {...props} />;
        case "checklist": return <DynamicChecklist key={key} config={content as WidgetChecklistConfig} {...props} />;
        case "timeline":  return <DynamicTimeline  key={key} config={content as WidgetTimelineConfig}  {...props} />;
        default:
            return null;
    }
};

const defaultColor: RgbValues = [36, 77, 138];
export const getDynamicColor = (rgb?: RgbValues, transparent?: number): string => {
    let vals: any;
    if (typeof(rgb) === 'undefined') { vals = defaultColor; } 
    else { vals = rgb.slice(); }

    if (typeof(transparent) !== 'undefined') { vals.push(transparent); }
    return `rgb(${vals.join(',')}`;
};

export const getDynamicIcon = (icon?: Icons): JSX.Element | null => {
    switch (icon) {
        case "checklist": return <VscChecklist />;
        case "plus": return <FiPlus />;
        case "med": return <GiMedicines />;
    }
    return null;
};

export const getDependentDatasets = (content: WidgetType[]): string[] => {
    const ids: Set<string> = new Set();

    for (const item of content) {
        switch (item.type) {
            case "row":
                const tempIds = getDependentDatasets((item as WidgetRowConfig).content as WidgetType[]);
                tempIds.forEach(id => ids.add(id));
                break;
            case "checklist":
                (item as WidgetChecklistConfig).datasets.forEach(ds => ids.add(ds.id));
                break;
            case "list":
                ids.add((item as WidgetListConfig).datasetId);
                break;
            case "timeline":
                const _item = item as WidgetTimelineConfig;
                _item.eventDatasets.forEach(ds => ids.add(ds.id));
                _item.numericDatasets.forEach(ds => ids.add(ds.id));
                if (_item.comparison.enabled && _item.comparison.filters) {
                    _item.comparison.filters.forEach(ds => ids.add(ds.datasetId));
                }
                break;
        }
    }

    return [ ...ids ];
};