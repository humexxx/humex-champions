import SignIn from './components/signin';

async function handleOnSubmit() {}

function App() {
  return (
    <>
      <SignIn handleOnSubmit={handleOnSubmit} />
    </>
  );
}

export default App;
