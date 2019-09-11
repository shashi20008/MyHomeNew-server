import React, {
  useCallback
} from 'react';
import Switch from '../../components/switch';
import { findParent } from '../../common/helper';

const formFieldsStyle = {
  'margin-top': '1rem'
};

export default function(props) {
  const onLeadUpdate = useCallback(e => {
    const { name, type, value, checked } = e.target;
    const finalValue = (type === 'checkbox' ? checked : value);
    const leadNum = findParent('lead-row', e.target).getAttribute('data-lead-num');
    props.updateLead(leadNum, { [name]: finalValue });
  }, prop.updateLead);

  return (
    <React.Fragment>
      <p>Device type: Generic switch board</p>
      <Form.Label style={formFieldsStyle}>Device label</Form.Label>
      <Form.Control 
        as="input"
        name="deviceLabel"
        placeholder="Give a friendly name" 
        onChange={props.updateValue} />
      <br />
      <hr />
      <p>This switch-board can control upto four devices.</p>
      <p>Enable the switches on which you've connected a device and give it a name.</p>
      <Form.Group style={formFieldsStyle}>
        {
          [0,1,2,3].map(rowNum => (
            <Row className="lead-row" style={ formFieldsStyle } data-lead-num={rowNum}>
              <Col xs={3}>
                <span className="align-middle">Switch {rowNum + 1}:</span>
              </Col>
              <Col xs={2}>
                <Switch name="enabled" onChange={onLeadUpdate} />
              </Col>
              <Col>
                <Form.Control 
                  name="label"
                  placeholder="Name of device" 
                  onChange={onLeadUpdate} />
              </Col>
            </Row>
          ))
        }
      </Form.Group>
    </React.Fragment>
  );
};
