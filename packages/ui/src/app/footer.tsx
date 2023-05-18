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
import { AvailableProvider } from '@openfeature/utils';
import React from 'react';
import { DASHBOARD_GREY } from './types';

export class Footer extends React.Component<{
  availableProviders: AvailableProvider[];
  currentProvider: string | undefined;
  tourAvailable: boolean;
  onSelectProvider: (event: SelectChangeEvent<string>) => void;
  onOpenTour: () => void;
}> {
  override render() {
    return (
      <AppBar
        className="footer"
        position="fixed"
        color="primary"
        sx={{ top: 'auto', bottom: 0, backgroundColor: `#${DASHBOARD_GREY}` }}
      >
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
                return (
                  <MenuItem key={p.id} value={p.id}>
                    {p.id}
                  </MenuItem>
                );
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
