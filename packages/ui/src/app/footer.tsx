import { AppBar, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Toolbar } from '@mui/material';
import React from 'react';

export class Footer extends React.Component<{
  availableProviders: string[];
  currentProvider: string | undefined;
  onSelectProvider: (event: SelectChangeEvent<unknown>) => void;
  onOpenTour: () => void;
}> {
  override render() {
    return (
      <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FormControl style={{ width: 160, color: 'white', borderColor: 'white', marginRight: 8 }}>
            <InputLabel style={{ color: 'white', borderColor: 'white' }} id="provider-select-label">
              Provider
            </InputLabel>
            <Select
              style={{ color: 'white' }}
              size="small"
              MenuProps={{
                style: { zIndex: 2000 },
              }}
              labelId="provider-select-label"
              label="Provider"
              color="primary"
              value={this.props.currentProvider}
              defaultValue={this.props.currentProvider}
              onChange={this.props.onSelectProvider}
            >
              {this.props.availableProviders.map((p) => {
                return <MenuItem value={p}>{p}</MenuItem>;
              })}
            </Select>
          </FormControl>

          <Button variant="outlined" color="inherit" onClick={() => this.props.onOpenTour()}>
            Open Tour
          </Button>
        </Toolbar>
      </AppBar>
    );
  }
}
