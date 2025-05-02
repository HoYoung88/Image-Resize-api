# Image-Resize-api

## Project setup
```
npm install -g pnpm
pnpm install
```

## Project dev
```
pnpm run dev
```

## Project build
```
pnpm run build
```

## Project run
```
pnpm run start
```

## API 
```
URL: /resize-image
Method: GET
Params:
    - url   | string    | image url
    - w     | number    | 100
    - h     | number    | 100
    - q     | float     | 0.0 ~ 1.0
    - c     | string    | c

response:
    image buffer

```
