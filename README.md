# Hash Generator

## How we are creating your document hash?

- we are using `crypto` package to generate document hash. which is `node js` Built-in module.
- In crypto there are so many algorithm's available. we are using `SHA-256`.
- After creating hash we are encoding into `hex` using crypto inbuild function `digest()`. it's take optional parameters that defines the type of returning output. for example `hex` and `base64`. if you don't pass anything you will get `Buffer` as a result.
- Check the below code to generate any document hash.

```JavaScript
const crypto = require("crypto");
const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
```
