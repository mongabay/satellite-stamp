# satellite-stamp

Tool to generate map images for Mongabay.

## Getting started

In order to start modifying the app, please make sure to correctly configure your workstation:

1. Make sure you you have [Node.js](https://nodejs.org/en/) installed
2. (Optional) Install [NVM](https://github.com/nvm-sh/nvm) to manage your different Node.js versions
3. (Optional) Use [Visual Studio Code](https://code.visualstudio.com/) as a text editor to benefit from automatic type checking
4. Configure your text editor with the [Prettier](https://prettier.io/), [ESLint](https://eslint.org/) and [EditorConfig](https://editorconfig.org/) plugins
5. Use the correct Node.js version for this app by running `nvm use`; if you didn't install NVM (step 2), then manually install the Node.js version described in `.nvmrc`
6. Install the dependencies: `yarn` (or `npm install`)
7. Create a `.env` file at the root of the project by copying `.env.default` and giving a value for each of the variables (currently, only `MAPBOX_API_KEY` is mandatory)
8. Run the server: `yarn dev` (or `npm run dev`)

You can access a hot-reloaded version of the app on [http://localhost:3000](http://localhost:3000).

The application is built using [React](https://reactjs.org/) and the framework [Next.js](https://nextjs.org/). The styles use [Sass](https://sass-lang.com/) and the [Bootstrap](https://getbootstrap.com/) framework.

A continuous deployment system is in place. Each time you push to the `master` branch, the application is deployed in GitHub Pages through a GitHub Action defined in `.github/workflows/build.yml`. You can see the status of the build in the “Actions” tab of the repository on GitHub.

## Adding new layers

In order to add new layers to the application, you need to follow the “Getting started” steps above (to run the project locally) and have access to Mongabay's Mapbox account.

### Uploading the layer to Mapbox

⚠️ Please be careful when making changes on Mapbox. The map style “PRODUCTION” should **never** be modified as it contains very strict rules on how the layers and groups are named, positioned and visible. **Making changes to this style will break the application.**

TODO: add Mapbox instructions here

#### Raster layer

TODO: add Mapbox instructions here

#### Vector layer

TODO: add Mapbox instructions here

### Modifying the code

Once you've added the layer to Mapbox, you need to tell the app about it. The layers are all configured in one file: `components/map/constants.js`.

There are two variable that you will need to modify:
- `DATA_LAYERS`
- `PRESETS`

`DATA_LAYERS` represents all the layers of the application. We will add a new item to the array.

`PRESETS` represents the list of presets available in the app. Each preset reference existing layers from `DATA_LAYERS`. If you don't want your new layer to be part of a preset, then you won't need to edit `PRESETS`.

##### Updating `DATA_LAYERS`

To help you understand the structure of a layer, search for `forest-canopy-height` in the code. The object associated with it represents the “Forest canopy height” raster layer which is stored in Mapbox.

Each layer have mandatory attributes:

- ID or slug: used as the key of the object (ex: `forest-canopy-height`)
- `label`: name of the layer, as shown in the UI (ex: `Forest canopy height`)
- `attributions`: list of attributions of the layer
- `config`: configuration of the layer for the [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/overview/) library
- `legend`: how the legend is displayed
- `decodeParams` and `decodeFunction` (optional): code to modify the color coding of each pixel of the layer

Let's add your new layer step by step.

First, at the end of the `DATA_LAYERS` array, add a new key (which is the ID of your layer) and as value, an empty object `{}`. For example:
```js
{
  'my-new-layer': {},
}
```

Then, add the `label` property and an empty array for the attributions:
```js
{
  'my-new-layer': {
	label: 'My new layer',
	attributions: [],
  },
}
```
If your layer comes from RW or if you need to add different attributions, then you must know `attributions` is an array of string, each string being the ID of an attribution. The attributions are stored in the `ATTRIBUTIONS` variable.

Then, let's add the configuration of the layer. First you need to log in to Mapbox and open the [Studio](https://studio.mapbox.com). There, click on “Tilesets” and search for your layer under “Custom tilesets”. Once identified, click the 3 dots on its right and copy the Tileset ID. From here, we can construct the config.

#### Raster layer

If your Tileset ID were `mongabay.XXXXXXXX`, then this is how you should define your layer:
```js
{
  'my-new-layer': {
	label: 'My new layer',
	attributions: [],
    config: {
      type: 'raster',
      source: {
        tiles: [
          `https://api.mapbox.com/v4/mongabay.XXXXXXXX/{z}/{x}/{y}.png?access_token=${process.env.MAPBOX_API_KEY}`,
        ],
        minzoom: 3,
        maxzoom: 12,
      },
    },
  },
}
```
Please make sure to replace `mongabay.XXXXXXXX` by your Tileset ID.

#### Vector layer

If your Tileset ID were `mongabay.XXXXXXXX`, then this is how you should define your layer:
```js
{
  'my-new-layer': {
	label: 'My new layer',
	attributions: [],
    config: {
      type: 'vector',
      source: {
		url: 'mapbox://mongabay.XXXXXXXX',
        minzoom: 3,
        maxzoom: 12,
      },
    },
  },
}
```
Please make sure to replace `mongabay.XXXXXXXX` by your Tileset ID.

This is not enough though, we still need to tell Mapbox how to color the geometries. For that, we'll add a `render` property (part of `config`), which will contain a `layers` array. The `layers` property will contain Mapbox' style for your layer.

TODO: explain how to add the `render` property

---

Next, we need to work on the legend. There are different types of legend: `basic`, `choropleth`, `gradient`, `group`, etc. Here we will explain the first 3, but you can find examples of all of them in the file.

A `basic` legend is a legend where each of the elements of the layer are coded by one color only. For a `basic` legend, you need to define an `items` array which contains objects with 2 attributes: `color` (hexadecimal) and `value` (name of the category it represents).

A `choropleth` legend is quite similar to the `basic` one but represents a choropleth, which means that each consecutive item builds on the previous one. The items of a `choropleth` legend are defined exactly the same as for the `basic` one.

A `gradient` legend is used when the elements of your layer use a continuous scale between several colors. Like `basic` legend, the `items` are defined the same way. The gradient will be automatically computed between the different stop colors. Please note that the labels (`value`) will be distributed equally in the legend so the consecutive items must have `value` attributes with the same difference (0, 5, and 10 all have a spacing of 5, but 0, 10 and 15 don't).

If you opted for a `basic` legend, here is how your layer looks like now:
```js
{
  'my-new-layer': {
	label: 'My new layer',
	attributions: [],
    config: {
      type: 'raster',
      source: {
        tiles: [
          `https://api.mapbox.com/v4/mongabay.XXXXXXXX/{z}/{x}/{y}.png?access_token=${process.env.MAPBOX_API_KEY}`,
        ],
        minzoom: 3,
        maxzoom: 12,
      },
	},
    legend: {
      type: 'basic',
      items: [
        {
          color: '#669900',
          name: 'Category 1',
        },
        {
          color: '#03755F',
          name: 'Category 2',
        },
        {
          color: '#222222',
          name: 'Category 3',
        },
      ],
    },
  },
}
```

At this point, and if you haven't done so already, please launch the local server: `yarn dev`. You should be able to see your layer in the tool.

If you're happy with the result, it's time to push your code:

1. Create a commit: `git commit -am 'Add new layer XXX'` (feel free to replace the message)
2. Push your changes: `git push origin master`
3. Go check the status of your build: https://github.com/mongabay/satellite-stamp/actions
4. After the app has been deployed and a few minutes have passed, check the online version of the tool. If you don't see the changes, clean your cache first and reload the page.

---

The next part explains the optional `decodeParams` and `decodeFunctions` attributes of the layer configuration.

The `decodeFunction` attribute is required if your layer stores the information it represents in one of the RGB bands. For example, the “Forest canopy height” layer stores the height of the trees in each of the R, G and B bands. When displaying the layer without the `decodeParams` and `decodeFunctions` attributes, the layer shows only grey pixels. It's because each pixel will display a color between #000000 (tree height of 0) and #323232 (tree height of 50; 32₁₆ = 50₁₀). The `decodeFunction` is a shader written in [GLSL](https://en.wikipedia.org/wiki/OpenGL_Shading_Language) which takes as an input a pixel and its 4 bands:

- R: `color.r`
- G: `color.g`
- B: `color.b`
- alpha: `alpha`

All the inputs and the outputs of the function use a continuous scale from 0 to 1. All the function does is to modify the values of the inputs (the 4 bands) so that the pixels will look differently.

The `decodeParams` object is mandatory if you set up a `decodeFunction`. You can simply give it the value of an empty object: `{}`. For other more complex layers such as “Tree cover loss”, the `decodeParams` attribute (and `decodeConfig`) are used to provide settings: for example, the start date and end date of a range. These settings are then available to the `decodeFunction` to compute the color of each pixel based on them.

The use of `decodeFunction` and `decodeParams` is for advanced users only as it requires deep knowledge about programming, and the architecture of the app and the underlying [layer-manager](https://github.com/Vizzuality/layer-manager/) library.


##### Updating `PRESETS` (optional)

If you want to add your new layer to an existing preset, you need to:
1. Navigate to the `PRESETS` variable in the code
2. Find the preset you're interested it (check its `label`)
3. Add your layer to the array `layers`

For example, this is how you would add a layer to the “Forest alerts” preset:
```js
{
  'forest-alerts': {
    label: 'Forest alerts',
    layers: [
      {
        id: 'glad',
      },
      {
        id: 'tree-cover',
      },
      {
        id: 'primary-forests',
	  },
	  {
	    id: 'my-new-layer',
	  },
    ],
  },
} 
```

Notice the new object with the `id` equal to `my-new-layer`.

If you wish to create a new preset, just follow the same structure as the others: the preset needs a key that will be its ID (for example, `my-new-preset`), a `label` that will be the name displayed in the UI and the list of layers it contains.

```js
{
  'my-new-preset': {
    label: 'My new preset',
    layers: [],
  },
} 
```

On the example above, you can see a preset without any layer.

Remember, if you edit the list of presets, please test your changes locally before pushing them to GitHub.
