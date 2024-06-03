[Counter (Obv) Example](https://jsfiddle.net/g9q7hbzc/)

[counter.html](examples/counter.html)

```html
<!-- From https://react.dev/learn#updating-the-screen -->
<!DOCTYPE html>
<html>

<body>
    <div id="root"></div>
</body>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" data-type="module">
    /** @jsx Reagi.createElement */
    /** @jsxFrag Reagi.Fragment */
    import Reagi, { createRoot, useState } from 'https://cdn.jsdelivr.net/gh/JasirZaeem/reagi@main/src/index.js';

    function App() {
        return (
            <div>
                <h1>Counter</h1>
                <CounterButton />
            </div>
        );
    }

    function CounterButton() {
        const [count, setCount] = useState(0);

        function handleClick() {
            setCount(count + 1);
        }

        return (
            <button onClick={handleClick}>
                Clicked {count} times
            </button>
        );
    }

    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
</script>

</html>
```

[Tic-Tac-Toe Example](examples/ttt.html) from [React's tutorial](https://react.dev/learn/tutorial-tic-tac-toe)
