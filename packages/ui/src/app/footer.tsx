import {
  AppBar,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Toolbar,
  Tooltip,
} from '@mui/material';
import React from 'react';

export class Footer extends React.Component<{
  availableProviders: string[];
  currentProvider: string | undefined;
  tourAvailable: boolean;
  onSelectProvider: (event: SelectChangeEvent<unknown>) => void;
  onOpenTour: () => void;
}> {
  override render() {
    return (
      <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FormControl
            className="step-switch-provider"
            style={{ width: 160, color: 'white', borderColor: 'white', marginRight: 8 }}
          >
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

          <Tooltip title={this.props.tourAvailable ? '' : 'Tour not available with this provider'}>
            <span>
              <Button
                disabled={!this.props.tourAvailable}
                className="step-open-tour"
                variant="outlined"
                color="inherit"
                onClick={() => this.props.onOpenTour()}
              >
                Open Tour
              </Button>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>
    );
  }
}
