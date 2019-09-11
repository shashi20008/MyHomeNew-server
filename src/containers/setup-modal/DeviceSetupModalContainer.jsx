import React, { Component } from 'react';
import { Modal, Form, Row, Col, Button } from 'react-bootstrap';

import * as API from '../../common/api';
import GenericSetup from './generic-setup';
import LightSetup from './light-setup';
import SwitchSetup from './switch-setup';

class DeviceSetupModalContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      leads: {}
    };

    this.roomRef = React.createRef();

    this.addDevice = this.addDevice.bind(this);
    this.updateSetupComponent = this.updateSetupComponent.bind(this);
    this.updateLead = this.updateLead.bind(this);
    this.updateValue = this.updateValue.bind(this);
  }

  componentDidMount() {
    API.getKnownDeviceList()
      .then(devices => this.setState({
        loading: false,
        devices
      }))
      .catch(err => this.setState({
        loading: false,
        error: true
      }));
  }

  updateLead(leadNum, mergeObj) {
    this.setState({
      leads: {
        ...this.state.leads,
        [leadNum]: {
          ...this.state.leads[leadNum],
          ...mergeObj
        }
      }
    })
  }

  updateValue(e) {
    const { name, type, value, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    this.setState({
      [name]: finalValue
    });
  }

  addDevice() {
    if(!this.state.selectedDevice || !this.state.deviceLabel || !this.roomRef.current.value) {
      console.log('validation failed!')
      return;
    }
    
    const selectedInputs = Object.keys(this.state.leads).filter(id => 
      this.state.leads[id].enabled && this.state.leads[id].label);
    if(selectedInputs.length === 0) {
      console.log('select at least one switch');
      return;
    }

    const request = {
      name: this.state.selectedDevice,
      label: this.deviceLabelRef.current.value,
      room: this.roomRef.current.value,
      leads: selectedInputs.map(id=> {
        const thisSwitch = this.state.leads[id];
        return {
          devId: id,
          label: thisSwitch.label
        }
      })
    }
    
    API.saveDeviceForUser(request)
      .then(() => {
          this.props.closeModal();
      })
      .catch(err => {
          console.log('an error occured:', err);
      });
  }

  updateSetupComponent(event) {
    const devName = event.target.value;
    const devType = this.state.devices[devName].type;

    if(devType === 'light') {
      this.SetupComponent = LightSetup
    }
    else if(devType === 'switch') {
      this.SetupComponent = SwitchSetup
    }
    else {
      this.SetupComponent = GenericSetup;
    }

    this.setState({
      devType
    });
  }

  getModalBody() {
    if(this.state.loading) {
      return <span>loading</span>;
    } else if(this.state.error){
      return <span>An error occured! Please try again later.</span>;
    } else if(Object.keys(this.state.devices || {}).length === 0) {
      return <span>No new devices found! If you have purchased a new device, make sure its plugged in and connected to your WiFi.</span>
    } else {
      return (
        <div>
          <Form.Label>Available devices</Form.Label>
          <Form.Control as="select" onChange={this.updateSetupComponent}>
            <option value="">Select one</option>
            {
                Object.keys(this.state.devices || {}).map(device => <option value={device}>{device}</option>)
            }
          </Form.Control>
          <Form.Label style={formFieldsStyle}>Room</Form.Label>
          <Form.Control placeholder="which room is this device in?" ref={this.roomRef}></Form.Control>
          
          <this.SetupComponent 
            updateValue={this.updateValue}
            updateLead={this.updateLead} />
          
          <Form.Group>
            <Button variant="primary" size="medium" style={{
              'margin-top': '20px',
              'margin-left': '140px',
              'width': '150px'
            }} 
            onClick={this.addDevice}>Save</Button>
          </Form.Group>
        </div>
      );
    }
  }

  render() {
    return (
      <Modal show={true} onHide={ this.props.closeModal }>
        <Modal.Header closeButton>
          <Modal.Title>Select a device</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { this.getModalBody() }
        </Modal.Body>
      </Modal>
    );
  }
}

export default DeviceSetupModalContainer;
