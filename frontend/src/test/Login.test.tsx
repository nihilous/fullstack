import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginJoin from '../components/LoginJoin';

const mockStore = configureStore([]);

describe('<LoginJoin />', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({
      app: {
        language: 'ENG',
      },
    });
  });

  it('displays English UI elements', () => {
    render(
        <Provider store={store}>
          <Router>
            <LoginJoin />
          </Router>
        </Provider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('switches to Finnish UI elements when language is FIN', () => {
    store = mockStore({
      app: {
        language: 'FIN',
      },
    });

    render(
        <Provider store={store}>
          <Router>
            <LoginJoin />
          </Router>
        </Provider>
    );

    expect(screen.getByLabelText(/sähköposti/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salasana/i)).toBeInTheDocument();
    expect(screen.getByText(/kirjaudu sisään/i)).toBeInTheDocument();
  });

  it('switches to Korean UI elements when language is KOR', () => {
    store = mockStore({
      app: {
        language: 'KOR',
      },
    });

    render(
        <Provider store={store}>
          <Router>
            <LoginJoin />
          </Router>
        </Provider>
    );

    expect(screen.getByLabelText(/purposeful fail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
    expect(screen.getByText(/로그인/i)).toBeInTheDocument();
  });

  it('switches between Login and Join forms', () => {
    render(
        <Provider store={store}>
          <Router>
            <LoginJoin />
          </Router>
        </Provider>
    );

    const joinButton = screen.getByText(/join/i);
    fireEvent.click(joinButton);

    expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password repeat/i)).toBeInTheDocument();
  });
});
