import { Box } from "@mui/material";
import { useApp } from "../../context/useApp.js";
import { INPUT_META, SECTION_ORDER } from "../../lib/defaults.js";
import InputSection from "./InputSection.jsx";
import SliderInput from "./SliderInput.jsx";
import SelectInput from "./SelectInput.jsx";
import ToggleInput from "./ToggleInput.jsx";
import ResourcePanel from "../resources/ResourcePanel.jsx";

export default function InputPanel() {
  const { state, dispatch } = useApp();
  const { variations, activeVariationId } = state;
  const activeVariation = variations.find((v) => v.id === activeVariationId);

  if (!activeVariation) return null;

  const { inputs, locked } = activeVariation;

  function handleChange(field, value) {
    dispatch({ type: "INPUT_CHANGED", payload: { variationId: activeVariation.id, field, value } });
  }
  function handleLock(field) {
    dispatch({ type: "LOCK_TOGGLED", payload: { variationId: activeVariation.id, field } });
  }

  // Group fields by section
  const sections = {};
  for (const [field, meta] of Object.entries(INPUT_META)) {
    if (!sections[meta.section]) sections[meta.section] = [];
    sections[meta.section].push({ field, meta });
  }

  return (
    <Box>
      {/* Resource list */}
      <ResourcePanel />

      {/* Parameter sections */}
      {SECTION_ORDER.map((sectionName) => {
        const fields = sections[sectionName] || [];
        return (
          <InputSection key={sectionName} title={sectionName}>
            {fields.map(({ field, meta }) => {
              const value = inputs[field];
              const isLocked = !!locked[field];
              const commonProps = { fieldKey: field, meta, value, locked: isLocked, onChange: (v) => handleChange(field, v), onLockToggle: () => handleLock(field) };
              if (meta.type === "slider")  return <SliderInput key={field} {...commonProps} />;
              if (meta.type === "select")  return <SelectInput key={field} {...commonProps} />;
              if (meta.type === "toggle")  return <ToggleInput key={field} {...commonProps} />;
              return null;
            })}
          </InputSection>
        );
      })}
    </Box>
  );
}
