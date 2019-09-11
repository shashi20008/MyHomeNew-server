import React, {
  useCallback,
  useState
} from 'react';
import { Modal, Form, Button, Alert, Card } from 'react-bootstrap';
import { register } from '../common/api';

export default function (props) {
  const [state, setState] = useState({
    email: '',
    password: '',
    name: ''
  });

  const updateState = useCallback(e => {
    const { name, value } = e.target;
    console.log(name, value);
    setState(state => ({ ...state, [name]: value }));
  }, []);

  const fieldProps = useCallback(name => {
    return {
      name,
      value: state[name],
      onChange: updateState
    };
  }, [state]);

  const registerUser = useCallback(e => {
    setState(state => ({...state, error:''}));
    register(state)
      .then(result => {
        const hubClientId = result.hubClientId;
        const hubClientSecret = result.hubClientSecret;

        if(hubClientId && hubClientSecret) {
          setState(state => ({...state, hubClientId, hubClientSecret}));
        }
      })
      .catch(err => {
        console.log(err);
        setState(state => ({...state, error: 'Registration failed!'}));
      })
  }, [state]);

  return (
    <Modal
      show={true}
      onHide={props.onClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Create an account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {state.error && <Alert variant="danger">{state.error}</Alert>}
        { 
          (state.hubClientId && state.hubClientSecret) 
          ?
          <React.Fragment> 
            <Alert variant="success">Registration successful.</Alert>
            <Card>
              <Card.Body>
                <p>Use following credentials to connect your hub to server.</p>
                <p>id: {state.hubClientId}</p>
                <p>secret: {state.hubClientSecret}</p>
              </Card.Body>
            </Card>
          </React.Fragment> 
          :
          <Form action="#">
            <Form.Group>
              <Form.Control {...fieldProps('name')} placeholder="Full name" />
            </Form.Group>
            <Form.Group>
              <Form.Control {...fieldProps('email')} placeholder="Email address" />
            </Form.Group>
            <Form.Group>
              <Form.Control {...fieldProps('password')} type="password" placeholder="Password" />
            </Form.Group>
            <Form.Group>
              <Button onClick={registerUser}>Register</Button>
            </Form.Group>
          </Form>
        }
      </Modal.Body>
    </Modal>
  );
}