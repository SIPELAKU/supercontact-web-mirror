import React from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';

interface RecipientSourceSelectorProps {
  value: 'mailing_list' | 'subscriber';
  onChange: (value: 'mailing_list' | 'subscriber') => void;
  disabled?: boolean;
}

/**
 * Component for selecting the source of campaign recipients.
 * Extracted to standardize UI across Add and Edit modals.
 */
const RecipientSourceSelector: React.FC<RecipientSourceSelectorProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const handleChange = (newValue: 'mailing_list' | 'subscriber') => {
    onChange(newValue);
  };

  return (
    <FormControl component="fieldset" disabled={disabled}>
      <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1, color: '#374151' }}>
        Recipient Source
      </FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => handleChange(e.target.value as 'mailing_list' | 'subscriber')}
      >
        <FormControlLabel 
          value="mailing_list" 
          control={<Radio size="small" />} 
          label="Mailing List" 
          slotProps={{ typography: { fontSize: '0.875rem' } }}
        />
        <FormControlLabel 
          value="subscriber" 
          control={<Radio size="small" />} 
          label="Contact (Subscribers)" 
          slotProps={{ typography: { fontSize: '0.875rem' } }}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default RecipientSourceSelector;
