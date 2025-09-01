# Upload API reference


The Upload API is a **rate-unlimited** RESTful API that enables you to upload your media assets (resources) and provides a wide range of functionality, including basic and advanced [asset management](#asset_management), [metadata management](#metadata_management), and [asset generation](#asset_generation). 
[Cloudinary's backend SDKs](backend_sdks) wrap these REST APIs, handle authentication, and enable you to perform these methods using your preferred programming language or framework. This reference provides both SDK and REST/cURL syntax and examples for each endpoint method.
> **See also**:
>
> For a detailed walkthrough of the upload process, see the [Upload guide](upload_images).

> **TIP**:
>
> :title=Tips

> * [MediaFlows](https://console.cloudinary.com/mediaflows), Cloudinary’s drag-and-drop workflow builder for image and video, supports all Upload API parameters in a low-code environment. See MediaFlow’s documentation on media upload [here](mediaflows_block_reference#upload_media). 

> * You can open the **Media Library** to confirm that your programmatic upload succeeded and that the asset has the expected transformations, tags, metadata, and other parameters. For more information, see the [Media Library for Developers](media_library_for_developers) page.

## Overview

By default, the API endpoints use the following format:

`https://api.cloudinary.com/v1_1/:cloud_name/:action`

For example, to upload an image asset to the `demo` product environment:

```
POST https://api.cloudinary.com/v1_1/demo/image/upload
```

Your Cloudinary **Cloud name** and **API Key** (which can be found on the [API Keys](https://console.cloudinary.com/settings/api-keys) page of the Cloudinary Console Settings) are used for the authentication. 

All the methods in this API also require a signature, for which you need your **API Secret**, to authenticate the request on the Cloudinary servers. The Cloudinary SDKs automatically generate this signature for you, so you only need to add it when using the REST API calls directly to the endpoint. For more details on how to manually generate a signature, see the [Generating authentication signatures](authentication_signatures) documentation.

> **INFO**: Never expose your API secret in public client-side code.

You can upload an image on your own Cloudinary product environment by replacing the `CLOUD_NAME`, `FILE`, `TIMESTAMP`, `API_KEY`, and `SIGNATURE` in the cURL command below:

```
curl https://api.cloudinary.com/v1_1/<CLOUD_NAME>/image/upload -X POST --data 'file=<FILE>&timestamp=<TIMESTAMP>&api_key=<API_KEY>&signature=<SIGNATURE>'
```

Responses to API calls include information about the action that was performed as well as data about the relevant assets. 

> **TIP**: For more in-depth documentation and general information on uploading media assets see the [Upload](upload_images) guide. For more information on calling the REST API methods directly, see the documentation on [Uploading with a direct call to the API](client_side_uploading#direct_call_to_the_api).

After you upload files, you can use the [Cloudinary Admin API](admin_api), which has useful methods for managing and organizing your media assets, such as listing all uploaded assets, listing tags, finding all assets that share a given tag, updating transformations, bulk deleting, and more.
> **INFO**: Cloudinary may add more fields to API responses and notifications in the future, so please ensure that your response parsing remains forward compatible and won't break as a result of unknown fields.

### Using Postman for Upload REST API calls
Take advantage of our [Cloudinary Postman Collections](https://www.postman.com/cloudinaryteam/workspace/programmable-media/overview?ctx=documentation) to experiment with our REST APIs and view the responses before adding them to your own code. 

Run in Postman

For details on setting up your own fork of our collections and configuring your Postman environment with your Cloudinary product environment credentials, see [Using Cloudinary Postman collections](using_cloudinary_postman_collections).

### Using SDKs with the Upload API

Our [backend SDK libraries](cloudinary_sdks#backend) provide a wrapper for the Upload API, enabling you to use your native programming language of choice. When using an SDK, request building and authentication are handled automatically, and the JSON response is parsed and returned. 

For example, you can use the following SDK command to create an image asset saved to your Cloudinary product environment from a string passed as a parameter:

```multi
|ruby 
result = Cloudinary::Uploader
.text(text)
  
|php_2
$result = $cloudinary->uploadApi()
->text($text);

|python
result = cloudinary.uploader\
.text(text)

|nodejs
cloudinary.v2.uploader
.text(text)
.then(result=>console.log(result));
  
|java
result = cloudinary.uploader()
.text(String text);

|csharp
result = cloudinary.Text(TextParams params);

|go
resp, err := cld.Upload.Text(ctx, uploader.TextParams{})

|swift
result = cloudinary.createManagementApi()
.text(text)

```

> **TIP**: SDK-specific documentation can be found in the [SDK Guides](cloudinary_sdks).
### Using the CLI to access the Upload API

You can use the Cloudinary CLI (Command Line Interface) to interact with the Upload API.  This can provide an easy way to add automation to your workflows and manage your assets without the need for a formal coding environment or having to access your Cloudinary Console. 

You can find instructions for setting up and using the CLI in the [CLI reference](cloudinary_cli).
### Error handling

The Admin API returns the status of requests using HTTP status codes:

**200**: OK | Success. 
**400**: Bad request. 
**401**: Authorization required. 
**403**: Not allowed. 
**404**: Not found. 
**409**: Already exists. 

The SDKs report errors by raising applicative exceptions.
Additionally, an informative JSON message is returned. For example:

```json
{ "error": { "message": "Resource not found - 5traNge_nam3" } }
```

### EU or AP data centers and endpoints	(premium feature)

> **NOTE**: This is a premium feature that is supported only for our [Enterprise plans](https://cloudinary.com/pricing#pricing-enterprise) and must be arranged when the account is created. [Contact our Enterprise support and sales team](https://cloudinary.com/contact?plan=enterprise) or your CSM for more information.

By default, Cloudinary accounts use US-based data centers. In these cases, the endpoint format is as shown at the beginning of this [Overview](#overview).

If the majority of your users are located in Europe or Asia, Cloudinary can set up your account to use our Europe (EU) or Asia Pacific (AP) data center. In that case, your endpoints will take the form: 

`https://api-eu.cloudinary.com/v1_1/:cloud_name/:action`

OR

`https://api-ap.cloudinary.com/v1_1/:cloud_name/:action`

> **TIP**: When using the Cloudinary SDKs you need to set the `upload_prefix` [configuration parameter](cloudinary_sdks#configuration_parameters).
---

## Asset management

Enables you to perform basic and advanced management tasks on your assets.

Method | Description
---|---
POST<code class="code-method">/:resource_type/upload |  [Uploads an asset to a Cloudinary product environment.](#upload)
POST<code class="code-method">/:resource_type/explicit | [Applies actions to existing assets.](#explicit)
POST<code class="code-method">/:resource_type/rename | [Renames an asset.](#rename)
POST<code class="code-method">/:resource_type/destroy |[Destroys an asset by public ID.](#destroy)
POST<code class="code-method">/:resource_type/destroy |[Destroys an asset by asset ID.](#destroy_by_asset_id)
GET<code class="code-method">/download_backup | [Gets a specific version of a backed-up asset.](#download_backup)

---

## upload

Run in Postman
Learn more about running Postman collections

Uploads an asset to your product environment. 

The Cloudinary SDKs wrap the `upload` endpoint and offer two separate methods: one for signed uploading and one for unsigned uploading.

> **NOTES**:
>
> * Some SDKs have a dedicated method for uploading large files using [chunked upload](upload_images#chunked_asset_upload).

> * The [Node.js SDK](node_image_and_video_upload#node_js_upload_methods) has several different methods for uploading files, including ones that take advantages of Node.js's **stream** functionality.

**Learn more**: [Upload guide](upload_images)

### Signed upload syntax

`POST /:resource_type/upload`

```multi
|ruby 
Cloudinary::Uploader.upload(file, options = {})
  
|php_2
$cloudinary->uploadApi()->upload($file, $options = []);
 
|python
cloudinary.uploader.upload(file, **options)

|nodejs
cloudinary.v2.uploader.upload(file, options).then(callback);
  
|java
cloudinary.uploader().upload(String file, Map options);

|csharp
cloudinary.Upload(UploadParams params);

|go
resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{})

|dart
cloudinary.uploader().upload(File(file), params: UploadParams(params));

|android
MediaManager.get().upload(file).dispatch();

|swift
cloudinary.createUploader().signedUpload(url: file, params: params) 

|cli
cld uploader upload $file [$options]
```

### Unsigned upload syntax

`POST /:resource_type/upload`

```multi
|ruby 
Cloudinary::Uploader.unsigned_upload(file, upload_preset, options = {})
  
|php_2
$cloudinary->uploadApi()->unsignedUpload($file, $upload_preset, $options = []);

|python
cloudinary.uploader.unsigned_upload(file, upload_preset, **options)

|nodejs
cloudinary.v2.uploader.unsigned_upload(file, upload_preset, options).then(callback);
  
|java
cloudinary.uploader().unsignedUpload(String file, String uploadPreset, Map options);

|csharp
cloudinary.Upload(UploadParams params); 

|dart
cloudinary.uploader().upload(File(file), params: UploadParams(uploadPreset, params));

|go
resp, err := cld.Upload.UnsignedUpload(ctx, file, upload_preset, uploader.UploadParams{})

|android
MediaManager.get().upload(file).unsigned(upload_preset).dispatch();

|swift
cloudinary.createUploader().signedUpload(url: file, uploadPreset: preset) 

|cli
cld uploader unsigned_upload $file $upload_preset [$options]
```
> **NOTE**: To support large file uploads, the Cloudinary SDKs include the `upload_large` method, which offers a degree of tolerance for network issues by uploading files to your product environment in chunks. It's required for any files that are larger than 100 MB or you will get a '413 Request entity too large' error. This is often relevant for video files, as they tend to have larger files sizes. See the [Chunked asset upload](upload_images#chunked_asset_upload) documentation for more details.

### Required parameters
Parameter | Type | Description
---|---|---
file  |  String | The file to upload. It can be: a local file path (supported in SDKs only)the remote HTTP or HTTPS URL address of an existing filea private storage bucket (S3 or Google Storage) URL of a **whitelisted** bucketthe actual data (byte array buffer). For example, in some SDKs, this could be an IO input stream of the data (e.g., File.open(file, "rb")). the Data URI (Base64 encoded), max ~60 MB (62,910,000 chars)the FTP address of an existing fileFor details and examples, see: [file source options](upload_parameters#required_file_parameter).
upload\_preset |  String | (Required for unsigned uploading / optional for signed uploading) Name of an upload preset that you defined for your Cloudinary product environment. An upload preset consists of upload parameters centrally managed using the Admin API or from the [Upload Presets](https://console.cloudinary.com/settings/upload/presets) page of the Console Settings. An upload preset may be marked as unsigned, which allows unsigned uploading directly from the browser and restricts the optional parameters to: `public_id`, `folder`, `tags`, `context`, `face_coordinates`, `regions` and `custom_coordinates`.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type | Description
---|---|---
`Naming and storage:` | |
public\_id  | String | The identifier that's used for accessing and delivering the uploaded asset. If not specified, then the public ID of the asset will either be comprised of random characters or will use the original file's filename, depending whether `use_filename` is set to true.Notes:The public ID value for images and videos shouldn't include a file extension. Include the file extension for `raw` files only.Can be up to 255 characters, including non-English characters, periods (`.`), forward slashes (`/`), underscores (`_`), hyphens (`-`).Can't begin or end with a space or forward slash (/).Shouldn't include any of these characters: `? & # \ % < > +`.
public\_id\_prefix | String | A string or path that's automatically prepended to the `public_id` with a forward slash. The value can contain the same characters as the `public_id` including additional forward slashes. This prefix can be useful to provide context and improve the SEO of an asset's filename in the delivery URL, but the value doesn't impact the location where the asset is stored.Components in the `public_id_prefix` can't start with 'v' followed by numeric characters, since that format is used for the version segment in delivery URLs. **Not relevant for product environments using the legacy fixed folder mode.**
display\_name | String | A user-friendly name for the asset.**Default:** Same value as the `public_id` (or the last segment of the public ID if the public ID includes slashes). Display names can have spaces and special characters and can have up to 255 characters, but can't include forward slashes (/). This name can be completely different than the asset's `public id` and its value doesn't impact the delivery URL in any way. The display name is shown in user interface pages such as the [Media Library](https://console.cloudinary.com/console/media_library/search), Cloudinary collections, and Cloudinary basic portals.   Though not a best practice, it's possible for the same display name to be used for different assets, even in the same asset folder. **Not relevant for product environments using the legacy fixed folder mode.**
asset\_folder | String |  The folder where the asset is placed within the Cloudinary repository. This value doesn't impact the asset’s public ID path (unless the `use_asset_folder_as_public_id_prefix` option is applied).**Default**: If not specified, the uploaded asset will be located in the root of your product environment asset repository, even if the public ID value includes slashes. **Notes**:Can be up to 255 characters, including non-English characters, periods (`.`), underscores (`_`), hyphens (`-`).Can't contain forward slashes (`/`). Additionally, they shouldn't include the following characters: `? & # \ % < > +`.Can't end with a space.**Not relevant for product environments using the legacy fixed folder mode.**
use\_asset\_folder\_as\_public\_id\_prefix | Boolean | Whether to add the `asset_folder` value as a prefix to the `public_id` value (prepended with a forward slash). This ensures that the public ID **path** will always match the **initial** asset folder, and can help to retain the behavior that previously existed in fixed folder mode. However, keep in mind that even when this option is used during upload, an asset with a certain public ID path can later be moved to a completely different asset folder hierarchy without impacting the public ID. This option only ensures path matching for the initial upload.Relevant only when `public_id_prefix` (or `folder`) has not been separately specified.**Default**: `false` **Not relevant for product environments using the legacy fixed folder mode.**
folder | String |  **Only relevant for product environments using the legacy fixed folder mode.** Defines both the full path of the folder where the uploaded asset will be placed and also a path value that's prepended to `public_id` value with a forward slash.None of the segments of the `folder` value can start with 'v' followed by numeric characters, because this format is reserved for the version segment of the URL. **Default**: root folder.**Note**: If [Dynamic folders](folder_modes) mode is enabled on your product environment, this parameter is deprecated, and it's recommended to use the `asset_folder` parameter to control where the asset will be placed. If you also want your `public_id` to match the **initial** asset folder path, include the `use_asset_folder_as_public_id_prefix`parameter.
use\_filename  |  Boolean | Whether to use the original file name of the uploaded file as the `public_id`. Relevant only if the `public_id` parameter isn't set. When false and the `public_id` parameter is also not defined, the public ID will be comprised of random characters. When true and the `public_id` parameter is not defined, the uploaded file's original filename becomes the public ID. Random characters are appended to the filename value to ensure public ID uniqueness if `unique_filename` is true. If the filename of the asset you upload contains a character that's not supported for public IDs, preceding/trailing occurrences are trimmed off, while illegal characters anywhere else in the filename are replaced with underscores.**Default**: `false`.
use\_filename\_as\_display\_name | Boolean |  Whether to automatically assign the original filename of the uploaded asset as the asset's **display name**. Relevant only if the `display_name` parameter isn't set.**Note**: If you set `use_filename_as_display_name` to `true` (in the upload call or upload preset) and the original filename of the asset includes forward slashes, the upload will fail with an error that the display name can't include slashes.**Default**: `false`. **Not relevant for product environments using the legacy fixed folder mode.**
unique\_filename | Boolean | When set to true, appends random characters to the end of the filename to guarantee its uniqueness. This parameter is relevant only if `use_filename` is also set to true. **Default**: `true`.
filename\_override | String | Sets the 'original-filename' metadata header stored on the asset (instead of using the actual filename of the uploaded file). Useful together with the `use_filename` parameter and for advanced search by filename, and relevant when delivering assets as attachments (setting the `flag` transformation parameter to `attachment`).
resource\_type  | String | Set the type of file you are uploading or use `auto` to automatically detect the file type. Only relevant as a parameter when using the SDKs (the `resource_type` is included in the endpoint URL when using the REST API). Valid values: `image`, `raw`, `video` and `auto`. **Defaults**: `image` for server-side uploading (with the exception of the Go SDK which defaults to `auto`) and `auto` for client-side uploading.**Note**: Use the `video` resource type for all video assets as well as for audio files, such as `.mp3`.
type  |  String | The delivery type. Allows uploading assets as `private` or `authenticated` instead of the default `upload` mode. Only relevant as a parameter when using the SDKs (the delivery `type` value is part of the endpoint URL when using the REST API). Valid values: `upload`, `private` and `authenticated`. **Default**: `upload`.
access\_control | JSON  | Restrict access to the asset by passing an array of access types for the asset. The asset is restricted unless one of the access types is valid. Possible values for each access type:- `token` requires either [Token-based access](control_access_to_media#token_based_access_premium_feature) or [Cookie-based access](control_access_to_media#cookie_based_access_premium_feature) for accessing the asset. For example: `access_type: "token"`- `anonymous` allows public access to the asset during a set time period. The anonymous access type can optionally include `start` and/or `end` dates (in ISO 8601 format) that define when the asset is publicly available. Note that you can only include a single 'anonymous' access type. For example: `access_type: "anonymous", start: "2017-12-15T12:00Z", end: "2018-01-20T12:00Z"` 
access\_mode | String | Allows the asset to behave as if it's of the authenticated 'type' (see above) while still using the default 'upload' type in delivery URLs. The asset can later be made public by changing its `access_mode` via the [Admin API](admin_api#update_access_mode), without having to update any delivery URLs. Valid values: `public`, and `authenticated`. **Default**: `public`. **Note**: The `access_mode` parameter is no longer supported. To restrict access to assets, you can use the `access_control` parameter. For more details, see [Access-controlled media assets](control_access_to_media#access_controlled_media_assets).
discard\_original\_filename |  Boolean | Whether to discard the name of the original uploaded file. Relevant when delivering assets as attachments (setting the `flag` transformation parameter to `attachment`). **Default**: `false`.
overwrite  | Boolean | Whether to overwrite existing assets with the same public ID. When set to false, a response is returned immediately if an asset with the same public ID is found. When overwriting assets, if you include [versions](advanced_url_delivery_options#asset_versions) in your delivery URLs, you will need to update the URLs with the new version number to deliver the new asset. If you don't include versions, you will need to [invalidate](invalidate_cached_media_assets_on_the_cdn) the old assets on the CDN server cache. **Default**: `true` (when using unsigned upload, the default is false and cannot be changed to true). **Important**: Depending on your product environment setup, overwriting an asset may clear the tags, contextual, and structured metadata values for that asset. If you have a [Master admin](dam_admin_users_groups#role_based_permissions) role, you can change this behavior for your product environment in the [Media Library Preferences](dam_admin_media_library_options) pane, so that these field values are retained when new version assets overwrite older ones (unless you specify different values for the `tags`, `context`, or `metadata` parameters as part of your upload).`Resource data:` | |
tags  |  String | A comma-separated list of tag names to assign to the uploaded asset for later group reference. For example: `animal,dog`**SDKs**: Supports arrays. For example: `['animal', 'dog']`
context | String | A pipe-separated list of the key-value pairs of contextual metadata to attach to an uploaded asset. The context values of uploaded files can be retrieved using the Admin API. For example: <code>alt=My image&#124;caption=Profile image**Notes**:The `=` and <code>&#124; characters can be supported as values when escaped with a prepended backslash (`\`). Key values are limited to 1024 characters and an asset can have a maximum of 1000 context key-value pairs.**SDKs**: Supports maps. For example: `['alt': 'My image', 'caption': 'Profile image']`
metadata | String | A pipe-separated list of custom metadata fields (by `external_id`) and the values to assign to each of them. For example: <code>in_stock_id=50&#124;color_id=[\"green\",\"red\"]. **SDKs**: Supports maps.**Notes**:The `=`, `"` and <code>&#124; characters can be supported as values when escaped with a prepended backslash (`\`).For a multi-select field, you can set a maximum of 3000 different metadata values on an asset.
clear\_invalid | Boolean | (Relevant for cascading metadata, and assets with multiple metadata fields) When updating the value of a metadata field results in another metadata field’s value becoming invalid, that invalid value is cleared instead of resulting in an error. **Default**: `false`.
colors  |Boolean | Whether to retrieve predominant colors & color histogram of the uploaded image. **Note**:If all returned colors are opaque, then 6-digit RGB hex values are returned. If one or more colors contain an alpha channel, then 8-digit RGBA hex quadruplet values are returned. **Default**: `false`. Relevant for images only.
faces  | Boolean | Whether to return the coordinates of faces contained in an uploaded image (automatically detected or manually defined). Each face is specified by the X & Y coordinates of the top left corner and the width & height of the face. The coordinates for each face are returned as an array (using the SDKs) or a comma-separated list (for REST API calls), and individual faces are separated with a pipe (<code>&#124;). For example: <code>10,20,150,130&#124;213,345,82,61. **Default**: `false`. Relevant for images only.
quality\_analysis | Boolean | Whether to return a quality analysis value for the image between 0 and 1, where 0 means the image is blurry and out of focus and 1 means the image is sharp and in focus. **Default**: `false`. Relevant for images only.Paid customers can [request to take part](https://support.cloudinary.com/hc/en-us/requests/new) in the [extended quality analysis](image_quality_analysis#extended_quality_analysis) Beta trial. When activated, this parameter returns quality scores for various other factors in addition to `focus`, such as `jpeg_quality`, `noise`, `exposure`, `lighting` and `resolution`, together with an overall weighted `quality_score`. The `quality_score`, `quality_analysis.color_score` and `quality_analysis.pixel_score` fields can be used in the Search API. 
accessibility\_analysis | Boolean | Currently available only to paid customers [requesting to take part](https://support.cloudinary.com/hc/en-us/requests/new) in the [accessibility analysis](accessibility_analysis) Beta trial. Set to `true` to return accessibility analysis values for the image and to enable the `accessibility_analysis.colorblind_accessibility_score` field to be used in the Search API.**Default**: `false`. Relevant for images only. 
cinemagraph\_analysis | Boolean | Whether to return a cinemagraph analysis value for the media asset between 0 and 1, where 0 means the asset is **not** a cinemagraph and 1 means the asset **is** a cinemagraph. **Default**: `false`. Relevant for animated images and video only. A static image will return 0.
image\_metadata | Boolean | Deprecated. Use `media_metadata` instead. **Default**: `false`.
media\_metadata| Boolean | Whether to return IPTC, XMP, and detailed Exif metadata of the uploaded asset in the response. **Default**: `false`. Supported for images, video, and audio. Returned metadata for images includes: `PixelsPerUnitX`, `PixelsPerUnitY`, `PixelUnits`, `Colorspace`, and `DPI`. Returned metadata for audio and video includes: `audio_codec`, `audio_bit_rate`, `audio_frequency`, `channels`, `channel_layout`. Additional metadata for video includes: `pix_format`, `codec`, `level`, `profile`, `video_bit_rate`, `dar`.(In .NET SDK, parameter name is `Metadata`.)
phash  | Boolean | Whether to return the perceptual hash (pHash) on the uploaded image. The pHash acts as a fingerprint that allows checking image similarity. **Default**: `false`. Relevant for images only.
responsive\_breakpoints | [JSON] | Requests that Cloudinary automatically find the best breakpoints. The parameter value is an array of breakpoint request settings, where each request setting can include the following parameters:`create_derived`(Boolean - Required) If true, create and keep the derived images of the selected breakpoints during the API call. If false, images generated during the analysis process are thrown away.`format` (String - Optional) Sets the file extension of the derived assets to the format indicated (as opposed to changing the format as part of a transformation - which would be included as part of the transformation component (e.g., f\_jpg)).`transformation` (String - Optional) The base transformation to first apply to the image before finding the best breakpoints. The API accepts a string representation of a chained transformation (same as the regular transformation parameter of the upload API).`max_width` (Integer - Optional) The maximum width needed for this image. If specifying a width bigger than the original image, the width of the original image is used instead. **Default**: `1000`.`min_width` (Integer - Optional) The minimum width needed for this image. **Default**: `50`. `bytes_step` (Integer - Optional) The minimum number of bytes between two consecutive breakpoints (images). **Default**: `20000`.`max_images` (Integer - Optional) The maximum number of breakpoints to find, between 3 and 200. This means that there might be size differences bigger than the given bytes\_step value between consecutive images. **Default**: `20`.The return response will include an array of the selected breakpoints for each breakpoint request, where the following information is given for each breakpoint: `transformation`, `width`, `height`, `bytes`, `url` and `secure_url`. Relevant for images only.
auto\_tagging | Decimal | Automatically assigns tags to an asset according to detected objects or categories with a confidence score higher than the specified value. Use together with the `detection` parameter for: [Cloudinary AI Content Analysis](cloudinary_ai_content_analysis_addon#automatic_image_tagging)[Amazon Rekognition Celebrity Detection](aws_rekognition_celebrity_and_face_detection_addon#automatically_adding_tags_to_images)Use together with the `categorization` parameter for: [Google Automatic Video Tagging](google_automatic_video_tagging_addon#adding_resource_tags_to_videos)[Google Auto Tagging](google_auto_tagging_addon#adding_resource_tags_to_images)[Imagga Auto Tagging](imagga_auto_tagging_addon#adding_resource_tags_to_images)[Amazon Rekognition Auto Tagging](aws_rekognition_auto_tagging_addon#automatically_adding_tags_to_images) **Range**: 0.0 to 1.0
categorization | String | A comma-separated list of the categorization add-ons to run on the asset. Set to `google_tagging`, `google_video_tagging`, `imagga_tagging` and/or `aws_rek_tagging` to automatically classify the scenes of the uploaded asset. Can be used together with the `auto_tagging` parameter to apply tags automatically. See the [Google Automatic Video Tagging](google_automatic_video_tagging_addon), [Google Auto Tagging](google_auto_tagging_addon), [Imagga Auto Tagging](imagga_auto_tagging_addon) and [Amazon Rekognition Auto Tagging](aws_rekognition_auto_tagging_addon) add-ons for more details.
detection | String | Invokes the relevant add-on to return a list of detected content. Set to:\_\[\<version\>\] (e.g. `coco_v2`) to return a list of detected content using the [Cloudinary AI Content Analysis](cloudinary_ai_content_analysis_addon#automatic_image_tagging) add-on. Can be used together with the `auto_tagging` parameter to apply tags automatically.`captioning` to analyze an image and [suggest a caption](cloudinary_ai_content_analysis_addon#ai_based_image_captioning) based on the image's contents.`iqa` to [analyze the quality](cloudinary_ai_content_analysis_addon#image_quality_analysis) of an image.`watermark-detection` to [detect watermarks](cloudinary_ai_content_analysis_addon#watermark_detection) in an image.`adv_face` to return a list of facial attributes using the [Advanced Facial Attribute Detection](advanced_facial_attributes_detection_addon) add-on.`aws_rek_face` to return a list of detected celebrities and facial attributes using the [Amazon Rekognition Celebrity Detection](aws_rekognition_celebrity_and_face_detection_addon) add-on. Can be used together with the `auto_tagging` parameter to apply tags automatically. Relevant for images only.
 auto_chaptering | Boolean | Whether to trigger automatic generation of video chapters. Chapters will be generated and saved as a .vtt file with `-chapters` appended to the public ID of the video. You can enable chapters as part of the [Cloudinary Video Player](video_player_customization#video_chapters). **Default**: `false`.  Relevant for videos only.
 auto_transcription | Boolean or Object | Whether to trigger [automatic video transcription](video_transcription) or a set of languages to translate the transcript to alongside the native language. The transcripts get generated and saved as a .transcript file with the same public ID as the video (and with the language code appended for the translated transcripts). You can use your transcript file to show subtitles or captions using the [Cloudinary Video Player](video_player_customization#subtitles_and_captions). **Default**: `false`.  Relevant for videos only.
 auto_video_details | Boolean | Whether to trigger automatic generation of AI-generated video title, description, and tags. The generated content includes `Video Title` and `Video Description` contextual metadata fields that the [Cloudinary Video Player](video_player_customization#video_titles_and_descriptions) version 3.1.0+ can use to display video title and description information, plus automatic tags for asset management. Cloudinary generates title and description only if no `Video Title` or `Video Description` context metadata values exist. Cloudinary adds any generated tags to existing tags on the asset. **Default**: `false`.  Relevant for videos only.Not currently supported by SDKs.
ocr | String | Set to `adv_ocr` to extract all text elements in an image as well as the bounding box coordinates of each detected element using the [OCR text detection and extraction add-on](ocr_text_detection_and_extraction_addon).Relevant for images only.
visual\_search | Boolean | Whether to index the image for use with [visual searches](admin_api#visual_search_for_resources). **Default**: false. Relevant for images only.
exif   | Boolean | Whether to retrieve the Exif metadata of the uploaded photo. **Default**: false. **Deprecated - use `media_metadata` instead**
`Manipulations:` | |
eager |  String | A list of transformations to create for the uploaded asset, instead of lazily creating them when first accessed by your site's visitors (see the [Transformation URL API Reference](transformation_reference) for more details on possible values). This option accepts either a single transformation or a pipe-separated list of transformations to create for the uploaded asset.**SDKs**: Supports arrays. (In .NET SDK, parameter name is `EagerTransforms`.)
eager\_async | Boolean | Whether to generate the eager transformations asynchronously in the background after the upload request is completed rather than online as part of the upload call. **Default**: `false`.
eager\_notification\_url | String | An HTTP or HTTPS URL to send a notification to (a webhook) when the generation of eager transformations is completed.
transformation | String | An incoming transformation to run on the uploaded asset before saving it in the cloud. This parameter is given as a string of comma-separated single characters (separated with a slash for chained transformations).**SDKs**: Supports a hash of transformation parameters (or an array of hashes for chained transformations). **Note**: When using the SDK for a dynamically typed language such as Ruby, the transformation parameters can be specified directly without using this `transformation` parameter.
format | String | An optional format to convert the uploaded asset to before saving in the cloud. For example: `jpg`.
custom\_coordinates | String | Relevant for images only. The coordinates of one or more regions contained in the image being uploaded that can be subsequently used for cropping or adding layers using the `custom` gravity mode. Specify regions by the X & Y coordinates of the top left corner and the width & height of the region, as a comma-separated list. For example: `85,120,220,310`. To specify more than one region, separate them with a  pipe (<code>&#124;), for example: <code>85,120,220,310&#124;150,180,100,300. **SDKs**: Supports arrays. For example: `[85, 120, 220, 310]`.[Learn more](custom_focus_areas#custom_coordinates).
regions | JSON | Relevant for images only. The coordinates of one or more named regions contained in the image being uploaded that can be subsequently used for cropping using the [region](transformation_reference#g_region) gravity mode. Each region is specified by a name (alphanumeric characters and hyphens permitted) and an array of at least two X,Y coordinate pairs, e.g., `{ "name1": [[1, 2], [3, 4]], "name2": [[5,6], [7,8], [9,10]] }`. If two pairs are specified, these refer to the top left and bottom right coordinates of a rectangle. Otherwise, if more pairs are specified, they refer to the corners of a custom region.[Learn more](custom_focus_areas#custom_regions).
face\_coordinates  |  String | Relevant for images only. The coordinates of faces contained in an uploaded image to override the automatically detected faces. Each face is specified by the X & Y coordinates of the top left corner and the width & height of the face. The coordinates for each face are given as a comma-separated list, with individual faces separated with a pipe (<code>&#124;)). **For example**: <code>10,20,150,130&#124;213,345,82,61.**SDKs**: Supports arrays. For example: `[[10, 20, 150, 130],[213, 345, 82, 61]]`.
background\_removal | String | Automatically remove the background of an image. Set to `cloudinary_ai` to use Cloudinary's built-in deep-learning based functionality. **Note**: It's recommended to store the original and use [background removal on the fly](background_removal). Set to `pixelz` to use the human-powered [Pixelz Remove-The-Background Editing add-on](remove_the_background_image_editing_addon) service.Relevant for images only.(Asynchronous) 
raw\_convert | String | Generates a related file based on the uploaded file.Set to `aspose` to automatically create a PDF or other image format from a `raw` Office document using the [Aspose Document Conversion add-on](aspose_document_conversion_addon). (Asynchronous)Set to `google_speech` to instruct the [Google AI Video Transcription](google_ai_video_transcription_addon) add-on to generate an automatic transcript `raw` file from an uploaded video. (Asynchronous)Set to `extract_text` to extract all the text from a PDF file and store it in a `raw` JSON file with a public ID in the format: **[pdf\_public\_id].extract_text.json**. The full URL of the generated JSON file is included in the API response. Unlike the above `raw_convert` options, this option doesn't require registering for an add-on.(Synchronous)  See also: [Converting raw files](upload_parameters#converting_raw_files).
|`Additional options:` | 
allowed\_formats | String | A comma-separated list of file formats that are allowed for uploading. Files of other types will be rejected. The formats can be any combination of image types, video formats or raw file extensions. For example: `mp4,ogv,jpg,png,pdf`. **Default**: any supported format for images and videos, and any kind of raw file (i.e. no restrictions by default). **SDKs**: Supports arrays. For example: `[mp4, ogv, jpg, png, pdf]`**Note**: You can also add the `format` parameter to convert other file types instead of rejecting them. In this case, only files that would normally be rejected are converted, any file format allowed for upload won't be converted.
async | Boolean | Tells Cloudinary whether to perform the upload request in the background (asynchronously). **Default**: `false`.**Note**: In the Python SDK, this parameter is passed as a dictionary: `**{"async": True}`
backup  | Boolean | Tell Cloudinary whether to [back up](backups_and_version_management) the uploaded asset. Overrides the default backup settings of your product environment.
callback | String |  **Deprecated**. A URL to redirect to after the upload is completed instead of returning the upload response. 
eval | String |  Allows you to modify upload parameters by specifying custom logic with JavaScript. This can be useful for conditionally adding tags, contextual metadata, structured metadata or eager transformations depending on specific criteria of the uploaded file. For more details see [Evaluating and modifying upload parameters](upload_parameters#eval_modify_upload_options_before_upload).
on_success | String |  Allows you to update an asset by specifying custom logic with JavaScript that is executed after the upload to Cloudinary is completed successfully. This can be useful for conditionally adding tags, contextual metadata, and structured metadata, depending on the results of using the `detection` parameter on upload. For more details see [On Success update script](upload_parameters#on_success_update_metadata_after_upload).
headers |String |An HTTP header or a list of headers lines for adding as response HTTP headers when delivering the asset to your users. Supported headers: `Link`, `Authorization`, `X-Robots-Tag`. For example: `X-Robots-Tag: noindex`.
invalidate  | Boolean | Whether to invalidate CDN cached copies of a previously uploaded asset (and all transformed versions that share the same public ID). **Default**: `false`.  It usually takes between a few seconds and a few minutes for the invalidation to fully propagate through the CDN. There are also a number of other [important considerations](invalidate_cached_media_assets_on_the_cdn) when using the invalidate functionality.
moderation | String | **For all asset types, set to**:`manual` to add the uploaded asset to a list of pending assets that can be moderated using the Admin API or the [Cloudinary Console](https://console.cloudinary.com/console/media_library).`perception_point` to automatically moderate the uploaded asset using the [Perception Point Malware Detection add-on](perception_point_malware_detection_addon). **For images only, set to**: `webpurify` to automatically moderate the uploaded image using the [WebPurify Image Moderation add-on](webpurify_image_moderation_addon).`aws_rek` to automatically moderate the uploaded image using the [Amazon Rekognition AI Moderation add-on](aws_rekognition_ai_moderation_addon).`duplicate:<threshold>` to detect if the same or a similar image already exists using the [Cloudinary Duplicate Image Detection add-on](cloudinary_duplicate_image_detection_addon). Set `threshold` to a float greater than 0 and less than or equal to 1.0 to specify how similar an image needs to be in order to be considered a duplicate. Set `threshold` to 0 to add an image to the index of images that are searched when duplicate detection is invoked for another image. **For videos only, set to**: `aws_rek_video` to automatically moderate the uploaded video using the [Amazon Rekognition Video Moderation add-on](aws_rekognition_video_moderation_addon).`google_video_moderation` automatically moderate the uploaded video using the [Google AI Video Moderation add-on](google_ai_video_moderation_addon). **To request [multiple moderations](moderate_assets#multiple_moderations) in a single API call**:Send the desired list of moderations as a pipe-separated string with `manual` moderation, if relevant, being last. For example: <code>aws_rek&#124;duplicate:0&#124;perception_point&#124;manual**Note**: Rejected assets are automatically [invalidated on the CDN](invalidate_cached_media_assets_on_the_cdn) within approximately ten minutes.(Asynchronous) 
notification\_url |  String | An HTTP or HTTPS URL to receive the upload response (a webhook) when the upload or any requested asynchronous action is completed. If not specified, the response is sent to the **Notification URL** (if defined) in the **Webhook Notifications** settings of your Cloudinary Console. 
proxy  | String | Tells Cloudinary to upload assets from remote URLs through the given proxy. Format: `https://hostname:port`.
return\_delete\_token | Boolean | Whether to return a deletion token in the upload response. The token can be used to delete the uploaded asset within 10 minutes using an unauthenticated API request. **Default**: `false`.
timeout | Integer | (SDKs only) Add this parameter to override the maximum amount of time to wait for a response from Cloudinary before the connection is terminated.

#### Unsigned upload parameters

You can define the following parameters directly in an unsigned upload request:

`upload_preset`, `public_id`, `public_id_prefix` ([dynamic-folder mode](folder_modes) only), `folder`, `asset_folder` ([dynamic-folder mode](folder_modes) only), `tags`, `context`, `metadata`, `face_coordinates`, `custom_coordinates`, `regions`, `source`, `filename_override`, `manifest_transformation`, `manifest_json`, `template`, `template_vars`.

While only certain parameters are allowed directly in unsigned requests, any permitted parameter can be included in an [upload preset](upload_presets).

**Parameters defined in both the request and the upload preset**

When an unsigned upload request includes one of the above supported parameters and the same parameter is also defined in the upload preset, Cloudinary handles precedence as follows:

* **Single-value parameters:**Cloudinary uses the value from the upload preset. The value in the request is used only if the preset doesn't define that parameter.

* **Multi-value parameters** (e.g., tags, context, metadata):Cloudinary merges the values from both the preset and the request.

This differs from signed uploads, where parameters defined in the request always take precedence over those in the preset.

> **NOTE**: Cloudinary always treats `overwrite` as `false` in unsigned uploads, even if the request or upload preset sets it to `true`.

### Examples
To upload an image by specifying the local path `/home/sample.jpg`:

```multi
|ruby
result = Cloudinary::Uploader
.upload("/home/sample.jpg")

|php_2
$result = $cloudinary->uploadApi()
->upload("/home/sample.jpg");

|python
result = cloudinary.uploader\
.upload("/home/sample.jpg")

|nodejs
cloudinary.v2.uploader
.upload("/home/sample.jpg")
.then(result=>console.log(result)); 

|java
result = cloudinary.uploader()
.upload("/home/sample.jpg", ObjectUtils.emptyMap());

|csharp
var uploadParams = new ImageUploadParams(){
  File = new FileDescription(@"/home/sample.jpg")};
var uploadResult = cloudinary.Upload(uploadParams);

|go
resp, err := cld.Upload.Upload(ctx, "/home/sample.jpg", uploader.UploadParams{})

|android
MediaManager.get()
.upload("/home/sample.jpg")
.dispatch();

|dart
cloudinary.uploader().upload(File('/home/sample.jpg'));

|swift
let params = CLDUploadRequestParams()
var mySig = MyFunction(params)  // your own function that returns a signature generated on your backend
params.setSignature(CLDSignature(signature: mySig.signature, timestamp: mySig.timestamp))
let request = cloudinary.createUploader().signedUpload(
  url: "/home/sample.jpg", params: params) 

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/upload -X POST -F 'file=@/path/to/sample.jpg' -F 'timestamp=173719931' -F 'api_key=614335564976464' -F 'signature=a781d61f86a6f818af'

|cli
cli uploader upload "/home/sample.jpg"
```

To upload an image from a remote url: `https://www.example.com/sample.jpg` and request Cloudinary to find the best breakpoints based on the following guidelines: a minimum width of 200 pixels, a maximum width of 1000 pixels, at least 20000 bytes file size difference between the breakpoints, while keeping the generated derived images:

```multi
|ruby 
result = Cloudinary::Uploader
.upload("https://www.example.com/sample.jpg", 
  responsive_breakpoints: { 
  	create_derived: true, 
  	bytes_step: 20000, 
  	min_width: 200, 
  	max_width: 1000})
  
|php_2
$result = $cloudinary->uploadApi()
->upload("https://www.example.com/sample.jpg", [
  	"responsive_breakpoints" => [
        "create_derived" => true, 
  	    "bytes_step" => 20000, 
  	    "min_width" => 200, 
  	    "max_width" => 1000 ]]);

|python
result = cloudinary.uploader\
.upload("https://www.example.com/sample.jpg", 
  responsive_breakpoints = { 
  	"create_derived": True, 
  	"bytes_step": 20000, 
  	"min_width": 200, 
  	"max_width": 1000 })

|nodejs
cloudinary.v2.uploader
.upload("https://www.example.com/sample.jpg",
  { responsive_breakpoints: 
  	{ create_derived: true, 
  	  bytes_step: 20000, 
  	  min_width: 200, 
  	  max_width: 1000 }})
.then(result=>console.log(result));
  
|java
result = cloudinary.uploader()
.upload("https://www.example.com/sample.jpg", 
  ObjectUtils.asMap(
  	"responsive_breakpoints", 
      new ResponsiveBreakpoint()
       .createDerived("true")
       .bytesStep(20000)
       .minWidth(200)
       .maxWidth(1000)));

|csharp
var uploadParams = new ImageUploadParams(){
  File = new FileDescription(@"https://www.example.com/sample.jpg"),
  ResponsiveBreakpoints = new List<ResponsiveBreakpoint> { 
  	new ResponsiveBreakpoint()
  	  .CreateDerived(true)
  	  .BytesStep(20000)
  	  .MinWidth(200)
  	  .MaxWidth(1000)}};
var uploadResult = cloudinary.Upload(uploadParams);

|go
resp, err := cld.Upload.Upload(ctx, "https://www.example.com/sample.jpg", uploader.UploadParams{
		ResponsiveBreakpoints: uploader.ResponsiveBreakpointsParams{
      uploader.SingleResponsiveBreakpointsParams{
        CreateDerived: api.Bool(true), 
        BytesStep: 20000, 
        MinWidth: 200, 
        MaxWidth: 200}}})

|android
MediaManager.get().upload("/home/sample.jpg")
  .option("responsive_breakpoints", new ResponsiveBreakpoint()
       .createDerived("true")
       .bytesStep(20000)
       .minWidth(200)
       .maxWidth(1000)).dispatch();

|dart
import 'package:cloudinary_api/src/request/model/params/responsive_breakpoint.dart';
...
cloudinary.uploader().upload(File('/home/sample.jpg'),
      params: UploadParams(
          responsiveBreakpoints: [ResponsiveBreakpoint(
            createDerived: true,
            byteStep: 20000,
            minWidth: 200,
            maxWidth: 1000)
          ],
    );

|swift
let responsive = CLDResponsiveBreakpoints(createDerived: true, bytesStep: 2000, minWidth: 200, maxWidth: 1000)
let params = CLDUploadRequestParams().setResponsiveBreakpoints(responsive)
var mySig = MyFunction(params)  // your own function that returns a signature generated on your backend
params.setSignature(CLDSignature(signature: mySig.signature, timestamp: mySig.timestamp))
let request = cloudinary.createUploader().signedUpload(
  url: "https://www.example.com/sample.jpg", params: params)

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/upload -X POST --data 'file=https://www.example.com/sample.jpg&responsive_breakpoint=[{"create_derived":true,"bytes_step":20000,"min_width":200,"max_width":1000}]&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af'

|cli
cld uploader upload "https://www.example.com/sample.jpg" responsive_breakpoints='{"create_derived": true, "bytes_step": 20000, "min_width": 200, "max_width": 1000}'

```

To upload an image from a remote FTP private server `ftp://ftp.example.com/sample.jpg` with a username of `user1` and a password of `mypass`. Two transformed images are also eagerly generated as follows: 
   
1. Pad to a width of 400 pixels and height of 300 pixels.
2. Crop to a width of 260 pixels and a height of 200 pixels with north gravity. 

```multi
|ruby  
result = Cloudinary::Uploader
.upload("ftp://user1:mypass@ftp.example.com/sample.jpg",
  eager: [
    {width: 400, height: 300, crop: "pad"}, 
    {width: 260, height: 200, crop: "crop", gravity: "north"}])
 
|php_2
$result = $cloudinary->uploadApi()
->upload("ftp://user1:mypass@ftp.example.com/sample.jpg", [ 
    "eager" => [
      ["width" => 400, "height" => 300, "crop" => "pad"],
      ["width" => 260, "height" => 200, "crop" => "crop", "gravity" => "north"]]]);

|python
result = cloudinary.uploader\
.upload("ftp://user1:mypass@ftp.example.com/sample.jpg", 
  eager = [
    {"width": 400, "height": 300, "crop": "pad"},
    {"width": 260, "height": 200, "crop": "crop", "gravity": "north"}])


|nodejs
cloudinary.v2.uploader
.upload("ftp://user1:mypass@ftp.example.com/sample.jpg", 
  { eager: [
    { width: 400, height: 300, crop: "pad" }, 
    { width: 260, height: 200, crop: "crop", gravity: "north"} ]}) 
  .then(result=>console.log(result));
  
|java
result = cloudinary.uploader()
.upload("ftp://user1:mypass@ftp.example.com/sample.jpg", 
  ObjectUtils.asMap(
    "eager", Arrays.asList(
      new EagerTransformation().width(400).height(300).crop("pad"),
      new EagerTransformation().width(260).height(200).crop("crop").gravity("north"))));

|csharp
var uploadParams = new ImageUploadParams(){
  File = new FileDescription(@"ftp://user1:mypass@ftp.example.com/sample.jpg"),
  EagerTransforms = new List<Transformation>(){
   new EagerTransformation().Width(400).Height(300).Crop("pad"),
   new EagerTransformation().Width(260).Height(200).Crop("crop").Gravity("north")}};
var uploadResult = cloudinary.Upload(uploadParams);  

|go
resp, err := cld.Upload.Upload(ctx, "ftp://user1:mypass@ftp.example.com/sample.jpg", uploader.UploadParams{
      Eager: "w_400,h_300,c_pad|w_260,h_200,c_crop,g_north"})

|android
MediaManager.get().upload("/home/sample.jpg")
  .option("eager", Arrays.asList(
      new EagerTransformation().width(400).height(300).crop("pad"),
      new EagerTransformation().width(260).height(200).crop("crop").gravity("north"))).dispatch();

|dart
import 'package:cloudinary_api/src/request/model/params/eager_transformation.dart';
...
var response = await cloudinary.uploader().upload(File('/home/sample.jpg'),
      params: UploadParams(
          eager: [EagerTransformation(Transformation().resize(Resize.pad()..width(400)..height(300))),
            EagerTransformation(Transformation().resize(Resize.crop()..width(260)..height(200)..gravity(Gravity.north())))],));

|swift
let eager1 = CLDEagerTransformation()
  .setWidth(400).setHeight(300).setCrop("pad")
let eager2 = CLDEagerTransformation()
  .setWidth(260).setHeight(200).setCrop("crop").setGravity("north")
let params = CLDUploadRequestParams().setEager([eager1, eager2])
var mySig = MyFunction(params)  // your own function that returns a signature generated on your backend
params.setSignature(CLDSignature(signature: mySig.signature, timestamp: mySig.timestamp))
let request = cloudinary.createUploader().signedUpload(url: "ftp://user1:mypass@ftp.example.com/sample.jpg", params: params)

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/upload -X POST --data 'file=ftp://user1:mypass@ftp.example.com/sample.jpg&eager=w_400,h_300,c_pad|w_260,h_200,c_crop,g_north&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af' 

|cli
cld uploader upload "ftp://user1:mypass@ftp.example.com/sample.jpg" eager='[{"width": 400, "height": 300, "crop": "pad"},{"width": 260, "height": 200, "crop": "crop", "gravity": "north"}]'
```
> **NOTE**: If running the CLI command on Windows, you need to escape the double quotes within the curly braces using either `\` or `"`, for example, `\"text\"` or `""text""`.
### Sample response
The following is a sample response based on the example upload of `sample.jpg` with two eager transformations and a request for detailed metadata (`media_metadata = true`). Because no public\_id was specified in the upload, a random public\_id was assigned.

```json
{
  "asset_id": "3515c6000a548515f1134043f9785c2f",
  "public_id": "gotjephlnz2jgiu20zni",
  "version": 1719307544,
  "version_id": "7d2cc533bee9ff39f7da7414b61fce7e",
  "signature": "d0b1009e3271a942836c25756ce3e04d205bf754",
  "width": 1920,
  "height": 1441,
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2024-06-25T09:25:44Z",
  "tags": [],
  "pages": 1,
  "bytes": 896838,
  "type": "upload",
  "etag": "2a2df1d2d2c3b675521e866599273083",
  "placeholder": false,
  "url": "http://res.cloudinary.com/cld-docs/image/upload/v1719307544/gotjephlnz2jgiu20zni.jpg",
  "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/v1719307544/gotjephlnz2jgiu20zni.jpg",
  "asset_folder": "",
  "display_name": "gotjephlnz2jgiu20zni",
  "image_metadata": {
    "JFIFVersion": "1.01",
    "ResolutionUnit": "None",
    "XResolution": "1",
    "YResolution": "1",
    "Colorspace": "RGB",
    "DPI": "0"
  },
  "illustration_score": 0.0,
  "semi_transparent": false,
  "grayscale": false,
  "original_filename": "sample",
  "eager": [
    {
      "transformation": "c_pad,h_300,w_400",
      "width": 400,
      "height": 300,
      "bytes": 26775,
      "format": "jpg",
      "url": "http://res.cloudinary.com/cld-docs/image/upload/c_pad,h_300,w_400/v1719307544/gotjephlnz2jgiu20zni.jpg",
      "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/c_pad,h_300,w_400/v1719307544/gotjephlnz2jgiu20zni.jpg"
    },
    {
      "transformation": "c_crop,g_north,h_200,w_260",
      "width": 260,
      "height": 200,
      "bytes": 8890,
      "format": "jpg",
      "url": "http://res.cloudinary.com/cld-docs/image/upload/c_crop,g_north,h_200,w_260/v1719307544/gotjephlnz2jgiu20zni.jpg",
      "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/c_crop,g_north,h_200,w_260/v1719307544/gotjephlnz2jgiu20zni.jpg"
    }
  ],
  "api_key": "614335564976464"
}
```

> **NOTES**:
>
> * The response for asynchronous uploads (when setting `async = true`) only includes a few details such as the `status` (pending) and a `batch_id` for tracking. Once the upload completes, the `notification_url` set for the asynchronous upload will receive the full response including the details in the example above.

> * If the public ID of the asset you're uploading already exists, the upload response includes whether the asset was `overwritten` or `existing` (depending on whether the `overwrite` parameter was set to true or false).

---

## explicit

Run in Postman
Learn more about running Postman collections

Updates existing assets already stored in your product environment. 

This can be useful for updating asset attributes, such as adding/modifying tags or structured metadata values, moving assets to new asset folder locations ([dynamic folder mode](folder_modes) only) or generating [eager transformations](eager_and_incoming_transformations#eager_transformations) to warm up the cache for faster delivery of complex transformations.

**Learn more**: [Updating existing assets](update_assets).

### Syntax
`POST /:resource_type/explicit`

```multi
|ruby 
Cloudinary::Uploader.explicit(public_id, options = {})
  
|php_2
$cloudinary->uploadApi()->explicit($public_id, $options = []);

|python
cloudinary.uploader.explicit(public_id, **options)

|nodejs
cloudinary.v2.uploader.explicit(public_id, options).then(callback);
  
|java
cloudinary.uploader().explicit(String public_id, Map options);

|csharp
cloudinary.Explicit(ExplicitParams params); // params includes PublicId

|go
resp, err := cld.Upload.Explicit(ctx, uploader.ExplicitParams{PublicID})

|swift
cloudinary.createManagementApi().explicit(publicId, params: params)

|dart
cloudinary.uploader().explicit(ExplicitParams(publicId,
        params: UploadParams(params)));

|cli
cld uploader explicit $public_id [$options]
```

### Required parameters
Parameter | Type| Description
 --- | --- | ---
public_id | String | The identifier of the uploaded asset or the URL of the remote asset. **Note**: The public ID value for images and videos should not include a file extension. Include the file extension for `raw` files only. 
type | String | The delivery type of the asset. For a list of all possible delivery types, see [Delivery types](image_transformations#delivery_types).
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type| Description
 --- | --- | ---
resource\_type  | String | The type of asset. Only relevant as a parameter when using the SDKs (the `resource_type` is included in the endpoint URL when using the REST API). Valid values: `image`, `raw`, and `video`. **Default**: `image`. **Note**: Use the `video` resource type for all video assets as well as for audio files, such as `.mp3`.
display\_name | String | A user-friendly name for the asset. Display names can have spaces and special characters and can have up to 255 characters, but can't include forward slashes (/). This name can be completely different than the asset's `public id` and its value doesn't impact the delivery URL in any way. The display name is shown in user interface pages such as the [Media Library](https://console.cloudinary.com/console/media_library/search), Cloudinary collections, and Cloudinary basic portals.   Though not a best practice, it's possible for the same display name to be used for different assets, even in the same asset folder. **Not relevant for product environments using the legacy fixed folder mode.**
asset\_folder | String |  The folder where the asset is placed within the Cloudinary repository.Setting this value in an `explicit` method moves the asset to the specified asset folder, but does not impact the asset’s public ID path. **Notes**:Can be up to 255 characters, including non-English characters, periods (`.`), underscores (`_`), hyphens (`-`).Can't contain forward slashes (`/`). Additionally, they can't include the following characters: `? & # \ % < >`.Can't end with a space.**Not relevant for product environments using the legacy fixed folder mode.**
eager | String | A list of transformations to create for the uploaded asset, instead of lazily creating them when first accessed by your site's visitors (see the [Transformation URL API Reference](transformation_reference) for more details on possible values). This option accepts either a single transformation or a pipe-separated list of transformations to create for the uploaded asset.**SDKs**: Supports arrays. (In .NET SDK, parameter name is `EagerTransforms`.)
async | Boolean | Whether to perform the request in the background (asynchronously). **Default**: `false`.
eager\_async | Boolean | Determines whether to generate the eager transformations asynchronously in the background. **Default**: `false`.
eager\_notification\_url | String | An HTTP or HTTPS URL to notify your application (a webhook) when the generation of eager transformations is completed.
overwrite | Boolean | When applying eager for already existing video transformations, this setting indicates whether to force the existing derived video resources to be regenerated. Default for videos: `false`.  **Note**: When specifying existing eager transformations for images, corresponding derived images are always regenerated. 
tags | String | A comma-separated list of tag names to assign to an asset that replaces any current tags assigned to the asset (if any). For example: `animal,dog`**SDKs**: Supports arrays. For example: `['animal', 'dog']`
invalidate | Boolean | Whether to invalidate the asset (and all its derived assets) on the CDN. **Default**: `false`.  It usually takes between a few seconds and a few minutes for the invalidation to fully propagate through the CDN. There are also a number of other [important considerations](invalidate_cached_media_assets_on_the_cdn) when using the invalidate functionality.
context | String | A pipe-separated list of the key-value pairs of contextual metadata to attach to an uploaded asset. The context values of uploaded files can be retrieved using the Admin API. For example: <code>alt=My image&#124;caption=Profile image**Notes**:The `=` and <code>&#124; characters can be supported as values when escaped with a prepended backslash (`\`). Key values are limited to 1024 characters and an asset can have a maximum of 1000 context key-value pairs.**SDKs**: Supports maps. For example: `['alt': 'My image', 'caption': 'Profile image']`
metadata | String | A pipe-separated list of custom metadata fields (by `external_id`) and the values to assign to each of them. For example: <code>in_stock_id=50&#124;color_id=[\"green\",\"red\"]. **SDKs**: Supports maps.**Notes**:The `=`, `"` and <code>&#124; characters can be supported as values when escaped with a prepended backslash (`\`).For a multi-select field, you can set a maximum of 3000 different metadata values on an asset.
headers | String | An HTTP header or a list of headers lines for returning as response HTTP headers when delivering the uploaded asset to your users. Supported headers: `Link`, `X-Robots-Tag`. For example: `X-Robots-Tag: noindex`.
face\_coordinates  |  String | Relevant for images only. The coordinates of faces contained in an uploaded image to override the automatically detected faces. Each face is specified by the X & Y coordinates of the top left corner and the width & height of the face. The coordinates for each face are given as a comma-separated list, with individual faces separated with a pipe (<code>&#124;). **For example**: <code>10,20,150,130&#124;213,345,82,61.**SDKs**: Supports arrays. For example: `[[10, 20, 150, 130],[213, 345, 82, 61]]`.
custom\_coordinates | String | Relevant for images only. The coordinates of one or more regions contained in an uploaded image that can be  subsequently used for cropping or adding layers using the `custom` gravity mode. Specify regions by the X & Y coordinates of the top left corner and the width & height of the region, as a comma-separated list. For example: `85,120,220,310`. To specify more than one region, separate them with a  pipe (<code>&#124;), for example: <code>85,120,220,310&#124;150,180,100,300. **SDKs**: Supports arrays. For example: `[85, 120, 220, 310]`.[Learn more](custom_focus_areas#custom_coordinates).
regions | JSON | Relevant for images only. The coordinates of one or more named regions contained in an uploaded image that can be subsequently used for cropping using the [region](transformation_reference#g_region) gravity mode. Each region is specified by a name (alphanumeric characters and hyphens permitted) and an array of at least two X,Y coordinate pairs, e.g., `{ "name1": [[1, 2], [3, 4]], "name2": [[5,6], [7,8], [9,10]] }`. If two pairs are specified, these refer to the top left and bottom right coordinates of a rectangle. Otherwise, if more pairs are specified, they refer to the corners of a custom region.[Learn more](custom_focus_areas#custom_regions).
notification\_url |  String | An HTTP or HTTPS URL to send the notification to (a webhook) when the operation or any additional requested asynchronous action is completed. If not specified, the response is sent to the **Notification URL** (if defined) in the **Webhook Notifications** settings of your Cloudinary Console.
image\_metadata | Boolean | Deprecated. Use `media_metadata` instead. **Default**: `false`.
media\_metadata | Boolean | Whether to return IPTC, XMP, and detailed Exif metadata of the uploaded asset in the response. **Default**: `false`. Supported for images, video, and audio. Returned metadata for images includes: `PixelsPerUnitX`, `PixelsPerUnitY`, `PixelUnits`, `Colorspace`, and `DPI`. Returned metadata for audio and video includes: `audio_codec`, `audio_bit_rate`, `audio_frequency`, `channels`, `channel_layout`. Additional metadata for video includes: `pix_format`, `codec`, `level`, `profile`, `video_bit_rate`, `dar`.(In .NET SDK, parameter name is `Metadata`.)
colors  |Boolean | Whether to retrieve predominant colors & color histogram of the uploaded image. If one or more colors contain an alpha channel, then 8-digit RGBA hex quadruplet values are returned. **Default**: `false`. Relevant for images only.
phash  | Boolean | Whether to return the perceptual hash (pHash) on the uploaded image. The pHash acts as a fingerprint that allows checking image similarity. **Default**: `false`. Relevant for images only.
faces  | Boolean | Whether to return the coordinates of faces contained in an uploaded image (automatically detected or manually defined). Each face is specified by the X & Y coordinates of the top left corner and the width & height of the face. The coordinates for each face are returned as an array (using the SDKs) or a comma-separated list (for REST API calls), and individual faces are separated with a pipe (<code>&#124;). For example: <code>10,20,150,130&#124;213,345,82,61. **Default**: `false`. Relevant for images only.
quality\_analysis | Boolean | Whether to return a quality analysis value for the image between 0 and 1, where 0 means the image is blurry and out of focus and 1 means the image is sharp and in focus. **Default**: `false`. Relevant for images only.Paid customers can [request to take part](https://support.cloudinary.com/hc/en-us/requests/new) in the [extended quality analysis](image_quality_analysis#extended_quality_analysis) Beta trial. When activated, this parameter returns quality scores for various other factors in addition to `focus`, such as `jpeg_quality`, `noise`, `exposure`, `blockiness` and `resolution`, together with an overall weighted `quality_score`. **Note**: Unlike when used with the [upload](#upload) method, the returned `quality_score`, `quality_analysis.color_score` and `quality_analysis.pixel_score` fields are not indexed for search.
accessibility\_analysis | Boolean | Currently available only to paid customers [requesting to take part](https://support.cloudinary.com/hc/en-us/requests/new) in the [accessibility analysis](accessibility_analysis) Beta trial. Set to `true` to return accessibility analysis values for the image.**Default**: `false`. Relevant for images only. **Note**: Unlike when used with the [upload](#upload) method, the `accessibility_analysis.colorblind_accessibility_score` field is not indexed for search.
quality\_override | String | Sets a quality value to override the value used when the image is encoded with Cloudinary's automatic content-aware quality algorithm.
cinemagraph\_analysis | Boolean | Whether to return a cinemagraph analysis value for the media asset between 0 and 1, where 0 means the asset is **not** a cinemagraph and 1 means the asset **is** a cinemagraph. **Default**: `false`. Relevant for animated images and video only. A static image will return 0.
moderation | String | **For all asset types, set to**:`manual` to add the asset to a list of pending assets that can be moderated using the Admin API or the [Cloudinary Console](https://console.cloudinary.com/console/media_library).`perception_point` to automatically moderate the uploaded asset using the [Perception Point Malware Detection add-on](perception_point_malware_detection_addon). **For images only, set to**: `webpurify` to automatically moderate the image using the [WebPurify Image Moderation add-on](webpurify_image_moderation_addon).`aws_rek` to automatically moderate the image using the [Amazon Rekognition AI Moderation add-on](aws_rekognition_ai_moderation_addon).`duplicate:<threshold>` to detect if the same or a similar image already exists using the [Cloudinary Duplicate Image Detection add-on](cloudinary_duplicate_image_detection_addon). Set `threshold` to a float greater than 0 and less than or equal to 1.0 to specify how similar an image needs to be in order to be considered a duplicate. Set `threshold` to 0 to add an image to the index of images that are searched when duplicate detection is invoked for another image.  **For videos only, set to**: `aws_rek_video` to automatically moderate the uploaded video using the [Amazon Rekognition Video Moderation add-on](aws_rekognition_video_moderation_addon).`google_video_moderation` automatically moderate the uploaded video using the [Google AI Video Moderation add-on](google_ai_video_moderation_addon). **To request [multiple moderations](moderate_assets#multiple_moderations) in a single API call**:Send the desired list of moderations as a pipe-separated string with `manual` moderation, if relevant, being last. For example: <code>aws_rek&#124;duplicate:0&#124;perception_point&#124;manual**Note**: Rejected assets are automatically [invalidated on the CDN](invalidate_cached_media_assets_on_the_cdn) within approximately ten minutes.
responsive\_breakpoints | [JSON] | Requests that Cloudinary automatically find the best breakpoints. The parameter value is an array of breakpoint request settings, where each request setting can include the following parameters:`create_derived`(Boolean - Required) If true, create and keep the derived images of the selected breakpoints during the API call. If false, images generated during the analysis process are thrown away.`format` (String - Optional) Sets the file extension of the derived assets to the format indicated (as opposed to changing the format as part of a transformation - which would be included as part of the transformation component (e.g., f\_jpg)).`transformation` (String - Optional) The base transformation to first apply to the image before finding the best breakpoints. The API accepts a string representation of a chained transformation (same as the regular transformation parameter of the upload API).`max_width` (Integer - Optional) The maximum width needed for this image. If specifying a width bigger than the original image, the width of the original image is used instead. **Default**: `1000`.`min_width` (Integer - Optional) The minimum width needed for this image. **Default**: `50`. `bytes_step` (Integer - Optional) The minimum number of bytes between two consecutive breakpoints (images). **Default**: `20000`.`max_images` (Integer - Optional) The maximum number of breakpoints to find, between 3 and 200. This means that there might be size differences bigger than the given bytes\_step value between consecutive images. **Default**: `20`.The return response will include an array of the selected breakpoints for each breakpoint request, where the following information is given for each breakpoint: `transformation`, `width`, `height`, `bytes`, `url` and `secure_url`. Relevant for images only.
auto_chaptering | Boolean | Whether to trigger automatic generation of video chapters. Chapters will be generated and saved as a .vtt file with `-chapters` appended to the public ID of the video. You can enable chapters as part of the [Cloudinary Video Player](video_player_customization#video_chapters). **Default**: `false`.  Relevant for videos only.
auto_transcription | Boolean or Object | Whether to trigger automatic video transcription, or a set of languages to translate the transcript to, alongside the native language. The transcripts get generated and saved as a .transcript file with the same public ID as the video (and with the language code appended for the translated transcripts). You can use your transcript file to show subtitles or captions using the [Cloudinary Video Player](video_player_customization#subtitles_and_captions). **Default**: `false`.  Relevant for videos only.
auto_video_details | Boolean | Whether to trigger automatic generation of AI-generated video title, description, and tags. The generated content includes `Video Title` and `Video Description` contextual metadata fields that the [Cloudinary Video Player](video_player_customization#video_titles_and_descriptions) version 3.1.0+ can use to display video title and description information, plus automatic tags for asset management. Cloudinary generates title and description only if no existing `Video Title` or `Video Description` context metadata values exist. Cloudinary adds any generated tags to existing tags on the asset. **Default**: `false`.  Relevant for videos only.Not currently supported by SDKs.

### Example
To perform two eager transformations for the already uploaded image with a public ID of `sample` as follows:
   
1. Crop to a width and height of 400 pixels including the biggest face detected. 
2. Pad to a width of 660 pixels and a height of 400 pixels with a blue background. 

```multi
|ruby  
result = Cloudinary::Uploader
.explicit("sample", 
  type: "upload",
  eager: [
    { width: 400, height: 400, 
	  crop: "crop", gravity: "face"}, 
	{ width: 660, height: 400, 
      crop: "pad", background: "blue"}])
 
|php_2
$result = $cloudinary->uploadApi()
->explicit("sample", [
    "type" => "upload", 
    "eager" => [
	  [ "width" => 400, "height" => 400,
		"crop" => "crop", "gravity" => "face"],
	  [ "width" => 660, "height" => 400,
		"crop" => "pad", "background" => "blue"]]]);
 
|python
result = cloudinary.uploader\
.explicit("sample", 
  type = "upload",
  eager = [
    { "width": 400, "height": 400,
	  "crop": "crop", "gravity": "face"},
	{ "width": 660, "height": 400,
	  "crop": "pad", "background": "blue"}])


|nodejs
cloudinary.v2.uploader
.explicit("sample", 
  { type: "upload",
	eager: [
	  { width: 400, height: 400,
		crop: "crop", gravity: "face"}, 
	  { width: 660, height: 400,
		crop: "pad", background: "blue"} ]})
.then(result=>console.log(result)); 

  
|java
result = cloudinary.uploader()
.explicit("sample", 
  ObjectUtils.asMap(
    "type", "upload",
    "eager", Arrays.asList(
      new EagerTransformation().width(400).height(400)
		.crop("crop").gravity("face"),
	  new Transformation().width(660).height(400)
		.crop("pad").background("blue"))));

|csharp
var explicitParams = new ExplicitParams("sample"){
  Type = "upload",
  EagerTransforms = new List<Transformation>(){
    new EagerTransformation().Width(400).Height(400)
      .Crop("crop").Gravity("face"),
    new Transformation().Width(660).Height(400)
      .Crop("pad").Background("blue")}};
var explicitResult = cloudinary.Explicit(explicitParams);

|go
resp, err := cld.Upload.Explicit(ctx, uploader.ExplicitParams{
    PublicID: "sample", 
    Type: "upload", 
    Eager: "w_400,h_400,c_crop,g_face|w_660,h_400,c_pad,b_blue"})

|dart
cloudinary.uploader().explicit(ExplicitParams("sample",
    params: UploadParams(
        type: "upload",
        eager: [EagerTransformation(Transformation().resize(Resize.crop()..width(400)..height(400)..gravity(Gravity.south())))])));

|swift
let eager1 = CLDEagerTransformation()
  .setWidth(400).setHeight(400).setCrop("crop").setGravity("face")
let eager2 = CLDEagerTransformation()
  .setWidth(660).setHeight(400).setCrop("pad").setBackground("blue")
let params = CLDExplicitRequestParams().setEager([eager1, eager2])
let result = cloudinary.createManagementApi().explicit(publicId, params: params)

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/explicit -X POST --data 'type=upload&public_id==sample&eager=w_400,h_400,c_crop,g_face|w_660,h_400,c_pad,b_blue&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af' 

|cli
cld uploader explicit "sample" type="upload" eager='[{ "width": 400, "height": 400,"crop": "crop", "gravity": "face"},{ "width": 660, "height": 400,"crop": "pad", "background": "blue"}]'
```

> **NOTE**: When you perform an eager transformation using `explicit`, the transformation is processed upon request (and counted in your transformation quota) even if an identical derived asset already exists.

### Sample response
The following is a sample response based on the example above. Two explicit transformations were performed on the `sample` image.

```json
{
  "asset_id": "03a5b92135161439031d3834c04bc31b",
  "public_id": "sample",
  "version": 1719304854,
  "version_id": "b4df5fee4358f099f58c6bdd07fcf01a",
  "signature": "9a98bec3f8947d518e1769366b86a59241368a89",
  "width": 864,
  "height": 576,
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2024-06-25T08:40:54Z",
  "tags": [],
  "bytes": 120253,
  "type": "upload",
  "placeholder": false,
  "url": "http://res.cloudinary.com/cld-docs/image/upload/v1719304854/sample.jpg",
  "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/v1719304854/sample.jpg",
  "asset_folder": "",
  "display_name": "sample",
  "eager": [
    {
      "transformation": "c_crop,g_face,h_400,w_400",
      "width": 400,
      "height": 400,
      "bytes": 27867,
      "format": "jpg",
      "url": "http://res.cloudinary.com/cld-docs/image/upload/c_crop,g_face,h_400,w_400/v1719304854/sample.jpg",
      "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/c_crop,g_face,h_400,w_400/v1719304854/sample.jpg"
    },
    {
      "transformation": "b_blue,c_pad,h_400,w_660",
      "width": 660,
      "height": 400,
      "bytes": 49666,
      "format": "jpg",
      "url": "http://res.cloudinary.com/cld-docs/image/upload/b_blue,c_pad,h_400,w_660/v1719304854/sample.jpg",
      "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/b_blue,c_pad,h_400,w_660/v1719304854/sample.jpg"
    }
  ]
}
```

---

## rename (public ID)

Run in Postman
Learn more about running Postman collections

Modifies the public ID (or optionally the delivery type) of an existing asset.

After running the `rename` method on an asset, the asset's existing URL and its associated derived assets are no longer valid, although delivery URLs already requested by visitors of your web site or application might still be accessible for a certain period of time through cached copies on the CDN. 

To bypass the CDN caching, you can include the `invalidate` parameter in your POST request in order to also invalidate the cached copies of the asset on the CDN. It usually takes between a few seconds and a few minutes for the invalidation to fully propagate through the CDN. For details on invalidating assets, see [Invalidating cached media assets on the CDN](invalidate_cached_media_assets_on_the_cdn). 

> **TIP**: [MediaFlows](https://console.cloudinary.com/mediaflows), Cloudinary’s drag-and-drop workflow builder for image and video, enables users to easily rename media at scale in a low-code implementation. See MediaFlow’s documentation on renaming media [here](mediaflows_block_reference#rename_media).

### Syntax
`POST /:resource_type/rename`

```multi
|ruby 
Cloudinary::Uploader.rename(from_public_id, to_public_id, options = {})
  
|php_2
$cloudinary->uploadApi()->rename($from_public_id, $to_public_id, $options = []);

|python
cloudinary.uploader.rename(from_public_id, to_public_id, **options)

|nodejs
cloudinary.v2.uploader.rename(from_public_id, to_public_id, options).then(callback);
  
|java
cloudinary.uploader().rename(String from_public_id, String to_public_id, Map options);

|csharp
cloudinary.Rename(renameParams); 

|go
resp, err := cld.Upload.Rename(ctx, uploader.RenameParams{FromPublicID, ToPublicID})

|android
MediaManager.get().rename(from_public_id, to: to_public_id);

|dart
var renameResponse = await cloudinary.uploader().rename(
    params: RenameParams(fromPublicId, toPublicId));

|swift
cloudinary.createManagementApi().rename(from_public_id, to: to_public_id, params: params)

|cli
cld uploader rename $from_public_id $to_public_id [$options]
```

> **TIP**:
>
> The `rename` method is relevant only for modifying the asset's public ID (including any segment of the public ID path). If you want to modify the asset's **display name** and/or **asset folder**, pass a new value for the `display_name` or `asset_folder` parameter in an [Explicit](#explicit) or [Update](admin_api#update_details_of_an_existing_resource) method call.

### Required parameters
Parameter | Type| Description
 --- | --- | ---
from\_public\_id | String | The current identifier of the uploaded asset.
to\_public\_id | String | The new identifier to assign to the uploaded asset.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type| Description
 --- | --- | ---
resource\_type  | String | The type of asset to rename. Only relevant as a parameter when using the SDKs (the `resource_type` is included in the endpoint URL when using the REST API). Valid values: `image`, `raw`, `video`. **Default**: `image`. **Note**: Use the `video` resource type for all video assets as well as for audio files, such as `.mp3`.
type  |  String | The delivery type of the asset. Only relevant as a parameter when using the SDKs (the delivery `type` is included in the endpoint URL when using the REST API). Valid values: `upload`, `private`, `authenticated`. **Default**: `upload`.
to\_type | String | The new delivery type for the asset. Valid values: `upload`, `private`, `authenticated`. **Default**: the asset's current type is unchanged.
overwrite | Boolean | Whether to overwrite an existing asset with the target public ID. **Default**: `false`.**Important**: Depending on your product environment setup, overwriting an asset may clear the tags, contextual, and structured metadata values for that asset. If you have a [Master admin](dam_admin_users_groups#role_based_permissions) role, you can change this behavior for your product environment in the [Media Library Preferences](dam_admin_media_library_options) pane, so that these field values are retained when new version assets overwrite older ones (unless you specify different values for the `tags`, `context`, or `metadata` parameters as part of your upload).notification\_url | String | An HTTP or HTTPS URL to notify your application (a webhook) when the process has completed. If not specified, the response is sent to the **Notification URL** (if defined) in the **Webhook Notifications** settings of your Cloudinary Console.  
invalidate | Boolean | Whether to invalidate CDN cached copies of the asset (and all its transformed versions). **Default**: `false`.  It usually takes between a few seconds and a few minutes for the invalidation to fully propagate through the CDN. There are also a number of other [important considerations](invalidate_cached_media_assets_on_the_cdn) when using the invalidate functionality
context | Boolean | Whether to include contextual metadata for the asset in the response. **Default**: `false`.
metadata | Boolean | Whether to include structured metadata for the asset in the response. **Default**: `false`.

### Example
To rename an image from `canyon` to `grand_canyon`:

```multi
|ruby
result = Cloudinary::Uploader
.rename('canyon', 'grand_canyon')

|php_2
$result = $cloudinary->uploadApi()
->rename('canyon', 'grand_canyon');

|python
result = cloudinary.uploader\
.rename("canyon", "grand_canyon")

|nodejs
cloudinary.v2.uploader
.rename('canyon', 'grand_canyon')
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.rename("canyon", "grand_canyon", 
  ObjectUtils.emptyMap());

|android
result = MediaManager.get().uploader()
.rename("canyon", "grand_canyon", 
  ObjectUtils.emptyMap());

|dart
cloudinary.uploader().rename(
    params: RenameParams(fromPublicId: "canyon", toPublicId: "grand_canyon"));

|csharp
var renameParams = new RenameParams(){
  FromPublicId = "canyon",
  ToPublicId = "grand_canyon"};
var renameResult = cloudinary.Rename(renameParams); 

|go
resp, err := cld.Upload.Rename(ctx, uploader.RenameParams{
      FromPublicID: "canyon", 
      ToPublicID: "grand_canyon"})
      
|swift
let result = cloudinary.createManagementApi().rename("canyon", to: "grand_canyon")

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/rename -X POST --data 'from_public_id=canyon&to_public_id=grand_canyon&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|cli
cld uploader rename "canyon" "grand_canyon"
```

### Sample response
The following is a sample response based on the example above. The `canyon` image was renamed to `grand_canyon`.

```json
{
  "asset_id": "7fdec030385c7a9aa0b0d1181d0ea25e",
  "public_id": "grand_canyon",
  "version": 1719308780,
  "version_id": "bf05d3dfd7f472c59c2b61703cdc8bef",
  "signature": "1775ae9bf2742ad560d9a718066b5579c41ed984",
  "width": 1920,
  "height": 1080,
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2024-06-25T09:46:20Z",
  "tags": [],
  "bytes": 681169,
  "type": "upload",
  "placeholder": false,
  "url": "http://res.cloudinary.com/cld-docs/image/upload/v1719308780/grand_canyon.jpg",
  "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/v1719308780/grand_canyon.jpg",
  "asset_folder": "",
  "display_name": "canyon"
}
```

---

## destroy (by public ID)

Run in Postman
Learn more about running Postman collections

Permanently deletes a single asset from your Cloudinary product environment based on public ID and resource type. 

**See also**: [destroy (by asset ID)](#destroy_by_asset_id)

> **INFO**:
>
> * If you have [backups](backups_and_version_management) enabled, the deleted asset remains in your backed up storage. Otherwise, the asset is permanently deleted, and can only {valeExclude}be recovered{/valeExclude} via a special request to customer support.

> * Keep in mind that even after deleting an asset, delivered original or transformed copies of the asset might still be accessible through cached copies on the CDN. 
>   To bypass CDN caching, you can include the `invalidate` parameter in your `destroy` request in order to also invalidate the cached copies of the asset on the CDN. It usually takes between a few seconds and a few minutes for the invalidation to fully propagate through the CDN. For details on invalidating media assets, see [Invalidating cached media assets on the CDN](invalidate_cached_media_assets_on_the_cdn). 

> * To delete multiple assets see the Admin API [Delete resources](admin_api#delete_resources) method.

### Syntax
`POST /:resource_type/destroy`

```multi
|ruby 
Cloudinary::Uploader.destroy(public_id, options = {})
  
|php_2
$cloudinary->uploadApi()->destroy($public_id, $options = []);
 
|python
cloudinary.uploader.destroy(public_id, **options)

|nodejs
cloudinary.v2.uploader.destroy(public_id, options).then(callback);
  
|java
cloudinary.uploader().destroy(String public_id, Map options);

|csharp
cloudinary.Destroy(deletionParams); 

|go
resp, err := cld.Upload.Destroy(ctx, uploader.DestroyParams{PublicID})

|swift
cloudinary.createManagementApi().destroy(public_id, params: params)

|cli
cld uploader destroy $public_id [$options]

|dart
cloudinary.uploader().destroy(DestroyParams(publicId: publicId));
```

### Required parameters
Parameter | Type| Description
 --- | --- | ---
public_id | String | The identifier of the uploaded asset. **Note**: The public ID value for images and videos should not include a file extension. Include the file extension for `raw` files only.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type | Description
 --- | --- | ---
resource\_type  | String | The type of asset to destroy. Only relevant as a parameter when using the SDKs (the `resource_type` is included in the endpoint URL when using the REST API). Valid values: `image`, `raw`, and `video`. **Default**: `image`. **Note**: Use the `video` resource type for all video assets as well as for audio files, such as `.mp3`.
type  |  String | The delivery type of the asset. Only relevant as a parameter when using the SDKs (the type is included in the endpoint URL when using the REST API). **Default**: `upload`. For a list of all possible delivery types, see [Delivery types](image_transformations#delivery_types).
notification\_url | String | An HTTP or HTTPS URL to notify your application (a webhook) when the process has completed. If not specified, the response is sent to the **Notification URL** (if defined) in the **Webhook Notifications** settings of your Cloudinary Console.
invalidate | Boolean | If true, invalidates CDN cached copies of the asset (and all its transformed versions). **Default**: `false`.  It usually takes between a few seconds and a few minutes for the invalidation to fully propagate through the CDN. There are also a number of other [important considerations](invalidate_cached_media_assets_on_the_cdn) when using the invalidate functionality. 

### Examples
Deleting an image with the public ID of `sample`:

```multi
|ruby
result = Cloudinary::Uploader
.destroy('sample')

|php_2
$result = $cloudinary->uploadApi()
->destroy('sample');

|python
result = cloudinary.uploader\
.destroy("sample")

|nodejs
cloudinary.v2.uploader
.destroy('sample')
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.destroy("sample",
  ObjectUtils.emptyMap());

|csharp
var deletionParams = new DeletionParams(){
  PublicId = "sample"};
var deletionResult = cloudinary.Destroy(deletionParams); 

|go
resp, err := cld.Upload.Destroy(ctx, uploader.DestroyParams{
      PublicID: "sample"})

|swift
cloudinary.createManagementApi().destroy("sample")

|curl
curl https://api.cloudinary.com/v1_1/demo/image/destroy -X POST --data 'public_id=sample&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|cli
cld uploader destroy "sample"

|dart
cloudinary.uploader().destroy(DestroyParams(publicId: 'sample'));
```

Deleting a video with the public ID of `sample`:

```multi
|ruby
result = Cloudinary::Uploader
.destroy('sample', resource_type: 'video')

|php_2
$result = $cloudinary->uploadApi()
->destroy('sample', ['resource_type' => 'video']);

|python
result = cloudinary.uploader\
.destroy("sample", resource_type = "video")

|nodejs
cloudinary.v2.uploader
.destroy('sample', {resource_type: 'video'})
.then(result => console.log(result))

|java
result = cloudinary.uploader()
.destroy("sample",
  ObjectUtils.asMap("resource_type","video"));

|csharp
var deletionParams = new DeletionParams("sample"){
  ResourceType = "video"};
var deletionResult = cloudinary.Destroy(deletionParams); 

|go
resp, err := cld.Upload.Destroy(ctx, uploader.DestroyParams{
      PublicID: "sample", 
      ResourceType: "video"})

|swift
let params = CLDDestroyRequestParams()
  .setResourceType("video")
let result = cloudinary.createManagementApi().destroy("sample", params: params)

|curl
curl https://api.cloudinary.com/v1_1/demo/image/destroy -X POST --data 'public_id=sample&resource_type=video&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|cli
cld uploader destroy "sample" resource_type=video

|dart
cloudinary.uploader().destroy(DestroyParams(publicId: 'sample', resourceType: 'video'));
```

### Sample response
A successful `destroy` operation returns the following:

```json
{
  "result": "ok"
}
```
## destroy (by asset ID)

Run in Postman
Learn more about running Postman collections

Permanently deletes a single asset from your Cloudinary product environment based on asset ID. 

**See also**: [destroy (by public ID)](#destroy)

> **INFO**:
>
> * If you have [backups](backups_and_version_management) enabled, the deleted asset remains in your backed up storage. Otherwise, the asset is permanently deleted, and can only {valeExclude}be recovered{/valeExclude} via a special request to customer support.

> * Keep in mind that even after deleting an asset, delivered original or transformed copies of the asset might still be accessible through cached copies on the CDN. 
>   To bypass CDN caching, you can include the `invalidate` parameter in your `destroy` request in order to also invalidate the cached copies of the asset on the CDN. It usually takes between a few seconds and a few minutes for the invalidation to fully propagate through the CDN. For details on invalidating media assets, see [Invalidating cached media assets on the CDN](invalidate_cached_media_assets_on_the_cdn). 

> * To delete multiple assets see the Admin API [Delete resources](admin_api#delete_resources) method.

### Syntax
`POST /:destroy`

```multi
|php_2
$cloudinary->uploadApi()->destroy($public_id, $options = []);
```

### Required parameters
Parameter | Type| Description
 --- | --- | ---
asset_id | String | The immutable, unique identifier of the uploaded asset. 
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type | Description
 --- | --- | ---
notification\_url | String | An HTTP or HTTPS URL to notify your application (a webhook) when the process has completed. If not specified, the response is sent to the **Notification URL** (if defined) in the **Webhook Notifications** settings of your Cloudinary Console.
invalidate | Boolean | If true, invalidates CDN cached copies of the asset (and all its transformed versions). **Default**: `false`.  It usually takes between a few seconds and a few minutes for the invalidation to fully propagate through the CDN. There are also a number of other [important considerations](invalidate_cached_media_assets_on_the_cdn) when using the invalidate functionality. 

### Examples
Deleting an image with the asset ID of `wu1js8tlwoib7839a0bkw`:

```multi
|curl
curl https://api.cloudinary.com/v1_1/demo/image/destroy -X POST --data 'asset_id=wu1js8tlwoib7839a0bkw&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|php_2
$result = $cloudinary->uploadApi()->destroyByAssetId(
    assetId: 'wu1js8tlwoib7839a0bkw'
);
```

### Sample response
A successful `destroy` operation returns the following:

```json
{
  "result": "ok"
}
```
---

## download_backup

Run in Postman
Learn more about running Postman collections

Retrieves a specific version of a [backed up asset](backups_and_version_management#versioning) without restoring it.

* The REST endpoint returns the specified version of the asset in bytes.
* The SDKs return a URL of the asset that you can use to download that version of the asset. The URL is valid only within an hour of the request.
  
### Syntax
`GET /download_backup`

```multi
|ruby 
url = Cloudinary::Utils.download_backedup_asset(asset_id, version_id)
  
|php_2
$url = $cloudinary->uploadApi()->downloadBackedupAsset($assetId, $versionId);

|python
url = cloudinary.utils.download_backedup_asset(asset_id, version_id)

|nodejs
string url = cloudinary.v2.utils.download_backedup_asset(asset_id, version_id);
  
|java
String url = cloudinary.downloadBackedupAsset(String asset_id, String version_id);

|csharp
var backupParams = new BackupParams() 
{ string AssetId, string VersionId };
var url = cloudinary.DownloadBackedupAsset(backupParams); 

|go
resp, err := cld.Upload.DownloadBackedUpAsset(uploader.DownloadBackedUpAssetParams{AssetID, VersionID})

|cli
cld utils download_backedup_asset $asset_id $version_id 

|dart
cloudinary.uploader().downloadBackedupAsset(DownloadBackupAssetParams(assetId, versionId));
```

### Required parameters
Parameter | Type| Description
 --- | --- | ---
asset_id | String | The identifier of the uploaded asset. **Note**: This is returned in the response to various Admin API methods.
version_id | String | The identifier of a backed up version of the asset. **Note**: To see details of backed up versions, including `version_id`, for a specific asset, use the [resource](admin_api#get_details_of_a_single_resource_by_public_id) method of the Admin API, setting the `versions` parameter to true.

### Example
To return the URL of a backed up version of an asset with `asset_id` of `62c2a18d622be7e190d21df8e05b1416` and `version_id` of `26fe6d95df856f6ae12f5678be94516a` (the cURL example returns the asset in bytes):

```multi
|ruby
result = Cloudinary::Utils
.download_backedup_asset('62c2a18d622be7e190d21df8e05b1416', '26fe6d95df856f6ae12f5678be94516a')

|php_2
$result = $cloudinary->uploadApi()
->downloadBackedupAsset('62c2a18d622be7e190d21df8e05b1416', '26fe6d95df856f6ae12f5678be94516a');

|python
result = cloudinary.utils\
.download_backedup_asset("62c2a18d622be7e190d21df8e05b1416", "26fe6d95df856f6ae12f5678be94516a")

|nodejs
cloudinary.v2.utils
.download_backedup_asset('62c2a18d622be7e190d21df8e05b1416', '26fe6d95df856f6ae12f5678be94516a')
.then(result=>console.log(result));

|java
result = cloudinary
.downloadBackedupAsset("62c2a18d622be7e190d21df8e05b1416", "26fe6d95df856f6ae12f5678be94516a",
  ObjectUtils.emptyMap());

|go
resp, err := cld.Upload.DownloadBackedUpAsset(uploader.DownloadBackedUpAssetParams{
    AssetID: "62c2a18d622be7e190d21df8e05b1416", 
    VersionID: "26fe6d95df856f6ae12f5678be94516a"})

|csharp
var backupParams = new BackupParams() 
{AssetId = "62c2a18d622be7e190d21df8e05b1416", VersionId = "26fe6d95df856f6ae12f5678be94516a"};
var url = cloudinary.DownloadBackedupAsset(backupParams); 

|curl
curl https://api.cloudinary.com/v1_1/demo/download_backup?timestamp=173719931&asset_id=62c2a18d622be7e190d21df8e05b1416&version_id=26fe6d95df856f6ae12f5678be94516a&signature=c9937fe93eb655ce04633034f921b83969eff9aa&api_key=323127161127519

|cli
cld utils download_backedup_asset "62c2a18d622be7e190d21df8e05b1416" "26fe6d95df856f6ae12f5678be94516a"

|dart
cloudinary.uploader().downloadBackedupAsset(DownloadBackupAssetParams("62c2a18d622be7e190d21df8e05b1416", "26fe6d95df856f6ae12f5678be94516a"));
```

### Sample response
The following is a sample SDK response based on the example above. The call returns the URL to download the requested backed up version of the asset.

```
https://api.cloudinary.com/v1_1/demo/download_backup?timestamp=173719931&asset_id=62c2a18d622be7e190d21df8e05b1416&version_id=26fe6d95df856f6ae12f5678be94516a&signature=c9937fe93eb655ce04633034f921b83969eff9aa&api_key=323127161127519
```

---

## Metadata management

Enables you to manage your assets' metadata.

Method | Description
---|---
POST<code class="code-method">/:resource_type/context |  [Manages the contextual metadata of an uploaded asset.](#context)
POST<code class="code-method">/:resource_type/metadata |[Adds values to metadata fields.](#metadata)
POST<code class="code-method">/:resource_type/tags | [Manages the tags applied to your assets.](#tags)
---

## context

Run in Postman
Learn more about running Postman collections

Enables you to manage the contextual metadata stored with an asset.

You can perform different operations with the `context` endpoint by setting the value of the `command` parameter to `add`, or `remove_all`. **SDKs:** The Cloudinary SDKs wrap the `context` endpoint and offer separate methods for these operations.

### Syntax - Add contextual metadata

`POST /:resource_type/context`

```multi
|ruby 
Cloudinary::Uploader.add_context(context, public_ids, options = {})
  
|php_2
$cloudinary->uploadApi()->addContext($context, $public_ids, $options = []);

|python
cloudinary.uploader.add_context(context, public_ids, **options)

|nodejs
cloudinary.v2.uploader.add_context(context, public_ids, options).then(callback);
  
|java
cloudinary.uploader().addContext(StringDictionary context, String[] public_ids, Map options);

|csharp
cloudinary.Context(contextParams); 

|go
resp, err := cld.Upload.AddContext(ctx, uploader.AddContextParams{Context, PublicIDs})

|cli
cld uploader add_context $context $public_ids [$options]
```

### Syntax - Remove all contextual metadata

`POST /:resource_type/context`

```multi
|ruby 
Cloudinary::Uploader.remove_all_context(public_ids, options = {})
  
|php_2
$cloudinary->uploadApi()->removeAllContext($public_ids, $options = []);

|python
cloudinary.uploader.remove_all_context(public_ids, **options)

|nodejs
cloudinary.v2.uploader.remove_all_context(public_ids, options).then(callback);
  
|java
cloudinary.uploader().removeAllContext(String[] public_ids, Map options);

|csharp
cloudinary.Context(contextParams); 

|go
resp, err := cld.Upload.RemoveAllContext(ctx, uploader.RemoveAllContextParams{PublicIDs})

|cli
cld uploader remove_all_context $public_ids [$options]
```

### Required parameters
Parameter | Type| Description
 --- | --- | ---
context | String | (Only relevant when adding contextual metadata) A pipe-separated list of the key-value pairs of contextual metadata to attach to an uploaded asset. The contextual metadata values of uploaded files can be retrieved using the Admin API. For example: <code>alt=My image&#124;caption=Profile image**Notes**:The `=` and <code>&#124; characters can be supported as values when escaped with a prepended backslash (`\`). Key values are limited to 1024 characters and an asset can have a maximum of 1000 contextual metadata key-value pairs.**SDKs**: Supports maps. For example: `['alt': 'My image', 'caption': 'Profile image']`
public\_ids | String[] | An array of public IDs of assets uploaded to Cloudinary.
command | String | (Only relevant when using the REST API - not for use with SDKs) The action to perform on assets: either `add` the specified contextual metadata, or `remove_all` the contextual metadata key-value pairs assigned.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type | Description
 --- | --- | ---
resource\_type  | String | The type of asset. Only relevant as a parameter when using the SDKs (the `resource_type` is included in the endpoint URL when using the REST API). Valid values: `image`, `raw`, and `video`. **Default**: `image`. **Note**: Use the `video` resource type for all video assets as well as for audio files, such as `.mp3`.
type  |  String | The delivery type of the asset. Only relevant as a parameter when using the SDKs (the delivery `type` is included in the endpoint URL when using the REST API). **Default**: `upload`. For a list of possible delivery types, see [Delivery types](image_transformations#delivery_types).

### Examples
To add the contextual metadata key-pairs `alt=Animal` and `class=Mammalia` to the images with the public IDs of `dog` and `lion`

```multi
|ruby
result = Cloudinary::Uploader
.add_context('alt=Animal|class=Mammalia', ['dog', 'lion'])

|php_2
$result = $cloudinary->uploadApi()
->addContext('alt=Animal|class=Mammalia', ['dog', 'lion']);

|python
result = cloudinary.uploader\
.add_context("alt=Animal|class=Mammalia", ["dog", "lion"])

|nodejs
cloudinary.v2.uploader
.add_context('alt=Animal|class=Mammalia', [ 'dog', 'lion' ])
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.addContext("alt=Animal|class=Mammalia",
  ["dog", "lion"], ObjectUtils.emptyMap());

|csharp
var contextParams = new ContextParams(){
  PublicIds = new List<string>(){"dog","lion"},
  Context = "alt=Animal|class=Mammalia",
  Command = ContextCommand.Add};
var contextResult = cloudinary.Context(contextParams); 

|curl
curl https://api.cloudinary.com/v1_1/demo/image/context -X POST --data 'context=alt%3DAnimal%7Cclass%3DMammalia&public_ids[]=dog&public_ids[]=lion&command=add&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|go
resp, err := cld.Upload.AddContext(ctx, uploader.AddContextParams{
    Context: map[string]string{"alt": "Animal", "class": "Mammalia"}, 
    PublicIDs: []string{"dog","lion"}})

|cli
cld uploader add_context 'alt=Animal|class=Mammalia' dog lion
```

To remove all existing contextual metadata for the images with the public IDs of `dog` and `lion`

```multi
|ruby
result = Cloudinary::Uploader
.remove_all_context(['dog', 'lion'])

|php_2
$result = $cloudinary->uploadApi()
->removeAllContext(['dog', 'lion']);

|python
result = cloudinary.uploader\
.remove_all_context(["dog", "lion"])

|nodejs
cloudinary.v2.uploader
.remove_all_context([ 'dog', 'lion' ])
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.removeAllContext(["dog", "lion"], ObjectUtils.emptyMap());

|csharp
var contextParams = new ContextParams(){
  PublicIds = new List<string>(){"dog","lion"},
  Command = ContextCommand.RemoveAll};
var contextResult = cloudinary.Context(contextParams); 

|go
resp, err := cld.Upload.RemoveAllContext(ctx, uploader.RemoveAllContextParams{
    PublicIDs: []string{"dog", "lion"}})

|curl
curl https://api.cloudinary.com/v1_1/demo/image/context -X POST --data 'public_ids[]=dog&public_ids[]=lion&command=remove_all&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|cli
cld uploader remove_all_context dog lion
```

### Sample response
The following is a sample response based on the example above. A contextual metadata value was added to the `dog` and `lion` images.

```json
{
  "public_ids": [
    "dog",
    "lion"
  ]
}
``` 

---

## metadata

Run in Postman
Learn more about running Postman collections

Adds values to an asset's metadata fields. 

**Learn more**: [Structured metadata](structured_metadata)

### Syntax
`POST /:resource_type/metadata`

```multi
|ruby 
Cloudinary::Uploader.update_metadata(metadata, public_ids, options = {})

|php_2
$cloudinary->uploadApi()->update_metadata($metadata, $public_ids, $options = array());
  
|python
cloudinary.uploader.update_metadata(metadata, public_ids, **options)

|nodejs
cloudinary.v2.uploader.update_metadata(metadata, public_ids, options).then(callback);
  
|java
cloudinary.uploader().updateMetadata(Map metadata, String[] public_ids, Map options);

|csharp
cloudinary.UpdateMetadata(metadataParams); 

|go
resp, err := cld.Upload.UpdateMetadata(ctx, uploader.UpdateMetadataParams{PublicIDs, Metadata})

|cli
cld uploader update_metadata $metadata $public_ids [$options]
```

### Required parameters
Parameter | Type | Description
--- | --- | ---
metadata | String | A pipe-separated list of custom metadata fields (by `external_id`) and the values to assign to each of them. For example: <code>in_stock_id=50&#124;color_id=[\"green\",\"red\"]. **SDKs**: Supports maps.**Notes**:The `=`, `"` and <code>&#124; characters can be supported as values when escaped with a prepended backslash (`\`).For a multi-select field, you can set a maximum of 3000 different metadata values on an asset.
public\_ids | String[] | An array of public IDs of assets uploaded to Cloudinary.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type | Description
--- | --- | --- 
resource\_type | String | The type of asset. Only relevant as a parameter when using the SDKs (the `resource_type` is included in the endpoint URL when using the REST API). Valid values: `image`, `raw`, and `video`. **Default**: `image`. **Note**: Use the `video` resource type for all video assets as well as for audio files, such as `.mp3`.
type  |  String | The delivery type. Valid values: `upload`, `private` and `authenticated`. **Default**: `upload`

### Example
To add the datasource IDs of "id\_us", "id\_uk", and "id\_france" to the metadata field with id 'countryFieldId', to the images with the public IDs of 'shirt' and 'pants':

```multi
|ruby
result = Cloudinary::Uploader
.update_metadata('countryFieldId=[\"id_us\",\"id_uk\",\"id_france\"]', ['shirt', 'pants'])

|php_2
$result = $cloudinary->uploadApi()
->update_metadata('countryFieldId=[\"id_us\",\"id_uk\",\"id_france\"]', ['shirt', 'pants']);

|python
result = cloudinary.uploader\
.update_metadata('countryFieldId=[\"id_us\",\"id_uk\",\"id_france\"]', ["shirt", "pants"])

|nodejs
cloudinary.v2.uploader
.update_metadata('countryFieldId=[\"id_us\",\"id_uk\",\"id_france\"]', [ 'shirt', 'pants' ])
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.updateMetadata(
  ObjectUtils.asMap(
    countryFieldId, 
    new String[]{"id_us", "id_uk", "id_france"}),
  new String[]{"pants", "shirt"}, 
  null);

|csharp
var metadataParams = new MetadataParams(){
  PublicIds = new List<string>(){'shirt','pants'},
  Metadata = 'countryFieldId=[\"id_us\",\"id_uk\",\"id_france\"]'};
var metadataResult = cloudinary.UpdateMetadata(metadataParams); 

|go
resp, err := cld.Upload.UpdateMetadata(ctx, uploader.UpdateMetadataParams{
    PublicIDs: []string{"sample"}, 
    Metadata: map[string][]string{"countryFieldId": []string{"id_us", "id_uk", "id_france"}}})

|curl
curl https://api.cloudinary.com/v1_1/demo/image/metadata -X POST --data 'metadata=countryFieldId%3D[\"id_us\",\"id_uk\",\"id_france\"]&public_ids[]=pants&public_ids[]=shirt&timestamp=173719931&api_key=436264276&signature=a788d62f86a2f862af'

|cli
cld uploader update_metadata 'countryFieldId=[\"id_us\",\"id_uk\",\"id_france\"]' shirt pants
```

### Sample response

The following is a sample response based on the example above. Metadata values were added to the shirt and pants images.

```json
{
  "public_ids": [
    "shirt",
    "pants"
  ]
}
```

---

## tags

Run in Postman
Learn more about running Postman collections

Enables you to manage the set of tags stored with an asset. 

You can perform different operations with the `tags` endpoint by setting the value of the `command` parameter to `add`, `remove`, `remove_all`, or `replace`. **SDKs:** The Cloudinary SDKs wrap the `tags` endpoint and offer 4 separate methods for these operations.

Tags are useful for categorizing and organizing your assets, as well as for applying group actions to assets, such as deleting multiple assets and creating ZIP files, JSON lists, or animated GIFs. 

A tag can have up to 255 characters. An asset can have up to 1000 tags.

**Learn more**: [Tags](tags)

### Adding tags syntax
`POST /:resource_type/tags`

```multi
|ruby 
Cloudinary::Uploader.add_tag(tag, public_ids, options = {})
  
|php_2
$cloudinary->uploadApi()->addTag($tag, $public_ids, $options = []);
  
|python
cloudinary.uploader.add_tag(tag, public_ids, **options)

|nodejs
cloudinary.v2.uploader.add_tag(tag, public_ids, options).then(callback);
  
|java
cloudinary.uploader().addTag(String tag, String public_ids, Map options);

|csharp
cloudinary.Tag(tagParams); 

|go
resp, err := cld.Upload.AddTag(ctx, uploader.AddTagParams{PublicIDs, Tag})

|swift
cloudinary.createManagementApi().addTag(tag, publicIds: publicIds, params: params)

|cli
cld uploader add_tag $tag $public_ids [$options]
```

### Removing tags syntax
`POST /:resource_type/tags`

```multi
|ruby 
Cloudinary::Uploader.remove_tag(tag, public_ids, options = {})
  
|php_2
$cloudinary->uploadApi()->removeTag($tag, $public_ids, $options = []);

|python
cloudinary.uploader.remove_tag(tag, public_ids, **options)

|nodejs
cloudinary.v2.uploader.remove_tag(tag, public_ids, options, callback);
  
|java
cloudinary.uploader().removeTag(String tag, String public_ids, Map options);

|csharp
cloudinary.Tag(tagParams); 

|go
resp, err := cld.Upload.RemoveTag(ctx, uploader.RemoveTagParams{PublicIDs, Tag})

|swift
cloudinary.createManagementApi().removeTag(tag, publicIds: publicIds, params: params)

|cli
cld uploader remove_tag $tag $public_ids [$options]
```

### Removing all tags syntax
`POST /:resource_type/tags`

```multi
|ruby 
Cloudinary::Uploader.remove_all_tags(public_ids, options = {})
  
|php_2
$cloudinary->uploadApi()->removeAllTags($public_ids, $options = []);
    
|python
cloudinary.uploader.remove_all_tags(public_ids, **options)

|nodejs
cloudinary.v2.uploader.remove_all_tags(public_ids, options).then(callback);
  
|java
cloudinary.uploader().removeAllTags(String public_ids, Map options);

|csharp
cloudinary.Tag(tagParams); 

|go
resp, err := cld.Upload.RemoveAllTags(ctx, uploader.RemoveAllTagsParams{PublicIDs})

|cli
cld uploader remove_all_tags $public_ids [$options]
```

### Replacing tags syntax
`POST /:resource_type/tags`

```multi
|ruby 
Cloudinary::Uploader.replace_tag(tag, public_ids, options = {})
  
|php_2
$cloudinary->uploadApi()->replaceTag($tag, $public_ids, $options = []);
 
|python
cloudinary.uploader.replace_tag(tag, public_ids, **options)

|nodejs
cloudinary.v2.uploader.replace_tag(tag, public_ids, options, callback);
  
|java
cloudinary.uploader().replaceTag(String tag, String public_ids, Map options);

|csharp
cloudinary.Tag(tagParams);

|go
resp, err := cld.Upload.ReplaceTag(ctx, uploader.ReplaceTagParams{PublicIDs, Tag})

|swift
cloudinary.createManagementApi().replaceTag(tag, publicIds: publicIds, params: params)

|cli
cld uploader replace_tag $tag $public_ids [$options]
```

### Required parameters
Parameter | Type| Description
 --- | --- | ---
tag | String | The tag(s) to assign, remove, or replace. Not relevant when removing all tags. You can pass multiple tags as a single comma-separated list of tag names to assign. For example: `animal,dog`**SDKs**: Supports arrays. For example: `['animal', 'dog']`
public\_ids | String | A list of public IDs for the assets you want to update.
command | String | (Only relevant when using the REST API or the .NET SDK - not for use with other SDKs) The action to perform on the assets: either `add` the given tag, `remove` the given tag, `remove_all` the tags assigned, or `replace` the given tag, which adds the given tag while removing all other tags assigned.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
{note}
This method supports a maximum of 1000 total operations (public\_ids * tags **Note**: Use the `video` resource type for all video assets as well as for audio files, such as `.mp3`.
type  |  String | The delivery type of the asset. Only relevant as a parameter when using the SDKs (the delivery `type` is included in the endpoint URL when using the REST API). **Default**: `upload`. For a list of possible delivery types, see [Delivery types](image_transformations#delivery_types).

### Examples
To add the tag `animal` to the images with the public IDs of `dog` and `lion`

```multi
|ruby
result = Cloudinary::Uploader
.add_tag('animal', ['dog', 'lion'])

|php_2
$result = $cloudinary->uploadApi()
->addTag('animal', ['dog', 'lion']);

|python
result = cloudinary.uploader\
.add_tag("animal", ["dog", "lion"])

|nodejs
cloudinary.v2.uploader
.add_tag('animal', [ 'dog', 'lion' ])
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.addTag("animal",
  ["dog", "lion"], ObjectUtils.emptyMap());

|csharp
var tagParams = new TagParams(){
  PublicIds = new List<string>(){"dog","lion"},
  Tag = "animal",
  Command = TagCommand.Add};
var tagResult = cloudinary.Tag(tagParams); 

|go
resp, err := cld.Upload.AddTag(ctx, uploader.AddTagParams{
		PublicIDs: []string{"dog", "lion"},
		Tag:       "animal"})

|swift
let result = cloudinary.createManagementApi().addTag("animal", publicIds: ["dog", "lion"])

|curl
curl https://api.cloudinary.com/v1_1/demo/image/tags -X POST --data 'tag=animal&public_ids[]=dog&public_ids[]=lion&command=add&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|cli
cld uploader add_tag animal dog lion
```

To remove the tag `animal` from the images with the public IDs of `dog` and `lion`

```multi
|ruby
result = Cloudinary::Uploader
.remove_tag('animal', ['dog', 'lion'])

|php_2
$result = $cloudinary->uploadApi()
->removeTag('animal', ['dog', 'lion']);

|python
result = cloudinary.uploader\
.remove_tag("animal", ["dog", "lion"])

|nodejs
cloudinary.v2.uploader
.remove_tag('animal', [ 'dog', 'lion' ])
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.removeTag("animal",
  ["dog", "lion"], ObjectUtils.emptyMap());

|csharp
var tagParams = new TagParams(){
  PublicIds = new List<string>(){"dog","lion"},
  Tag = "animal",
  Command = TagCommand.Remove};
var tagResult = cloudinary.Tag(tagParams); 

|go
resp, err := cld.Upload.RemoveTag(ctx, uploader.RemoveTagParams{
    PublicIDs: []string{"dog", "lion"}, 
    Tag: []string{"animal"}})

|swift
let result = cloudinary.createManagementApi().removeTag("animal", publicIds: ["dog", "lion"])

|curl
curl https://api.cloudinary.com/v1_1/demo/image/tags -X POST --data 'tag=animal&public_ids[]=dog&public_ids[]=lion&command=remove&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|cli
cld uploader remove_tag animal dog lion
```

To remove all existing tags for the images with the public IDs of `dog` and `lion`

```multi
|ruby
result = Cloudinary::Uploader
.remove_all_tags(['dog', 'lion'])

|php_2
$result = $cloudinary->uploadApi()
->removeAllTags(['dog', 'lion']);

|python
result = cloudinary.uploader
.remove_all_tags(["dog", "lion"])

|nodejs
cloudinary.v2.uploader
.remove_all_tags([ 'dog', 'lion' ])
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.removeAllTags(["dog", "lion"], 
  ObjectUtils.emptyMap());

|csharp
var tagParams = new TagParams(){
  PublicIds = new List<string>(){"dog","lion"},
  Command = TagCommand.RemoveAll};
var tagResult = cloudinary.Tag(tagParams); 

|go
resp, err := cld.Upload.RemoveAllTags(ctx, uploader.RemoveAllTagsParams{
    PublicIDs: []string{"dog", "lion"}})

|curl
curl https://api.cloudinary.com/v1_1/demo/image/tags -X POST --data 'public_ids[]=dog&public_ids[]=lion&command=replace_all&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|cli
cld uploader remove_all_tags dog lion
```

To replace all existing tags with the tag `animal` for the images with the public IDs of `dog` and `lion`

```multi
|ruby
result = Cloudinary::Uploader
.replace_tag('animal', ['dog', 'lion'])

|php_2
$result = $cloudinary->uploadApi()
->replaceTag('animal', ['dog', 'lion']);

|python
result = cloudinary.uploader\
.replace_tag("animal", ["dog", "lion"])

|nodejs
cloudinary.v2.uploader
.replace_tag('animal', [ 'dog', 'lion' ])
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.replaceTag("animal",
  ["dog", "lion"], ObjectUtils.emptyMap());

|csharp
var tagParams = new TagParams(){
  PublicIds = new List<string>(){"dog","lion"},
  Tag = "animal",
  Command = TagCommand.ReplaceAll};
var tagResult = cloudinary.Tag(tagParams); 

|go
resp, err := cld.Upload.ReplaceTag(ctx, uploader.ReplaceTagParams{ 
    PublicIDs: []string{"dog", "lion"},
    Tag: []string{"animal"}})

|swift
let result = cloudinary.createManagementApi().replaceTag("animal", publicIds: ["dog", "lion"])

|curl
curl https://api.cloudinary.com/v1_1/demo/image/tags -X POST --data 'tag=animal&public_ids[]=dog&public_ids[]=lion&command=replace&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|cli
cld uploader replace_tag animal dog lion
```

### Sample response
The following is a sample response based on the example above. A tag was added to the `dog` and `lion` images.

```json
{
  "public_ids": [
    "dog",
    "lion"
  ]
}
```

---

## Asset generation
Enables you to create different types of assets from existing assets.  The generated assets are stored as new assets in your product environment. 

Method | Description
---|---
POST<code class="code-method">/:resource_type/create_collage  | [Creates a collage from existing assets.](#create_collage_deprecated) (Deprecated)
POST<code class="code-method">/image/explode |[Derives images for the individual pages in a multi-page file (PDF or animated GIF).](#explode)
POST<code class="code-method">/:resource_type/generate_archive | [Creates an archive file from existing assets.](#generate_archive) 
POST<code class="code-method">/image/multi | [Generates animated images, videos, or PDFs from existing images.](#multi)
POST<code class="code-method">/image/sprite | [Generates sprites from existing assets.](#sprite_deprecated) (Deprecated)
POST<code class="code-method">/image/text | [Dynamically generates an image from a given textual string.](#text)

---

## create_collage (deprecated)
> **INFO**:
>
> The **Image Collage** feature using the `create_collage` method will be deprecated as of **September 16, 2025**, and will no longer function after that date. Be sure to remove it from any production code.
> You can continue creating collages using [overlays](image_collage_generation#create_collages_using_overlays).

---

## explode

Run in Postman
Learn more about running Postman collections

Generates derived images for each of the individual pages/frames in a multi-page file (PDF or animated image). 

You can deliver these derived images using the same public ID as the original file and applying the `page` transformation parameter to deliver a for the relevant page or frame. 

Note that you can also generate and deliver individual pages/frames from a multi-page file **on the fly** using the `page` transformation parameter. The `explode` method is useful for warming the cache in advance with all the pages/frames of the file to improve delivery performance on first access.

### Syntax
`POST /image/explode`

```multi
|ruby 
Cloudinary::Uploader.explode(public_id, options = {})
  
|php_2
$cloudinary->uploadApi()->explode($public_id, $options = []);
   
|python
cloudinary.uploader.explode(public_id, **options)

|nodejs
cloudinary.v2.uploader.explode(public_id, options).then(callback);
  
|java
cloudinary.uploader().explode(String public_id, Map options);

|csharp
cloudinary.Explode(ExplodeParams params); // params includes PublicId

|go
resp, err := cld.Upload.Explode(ctx, uploader.ExplodeParams{PublicID})

|swift
cloudinary.createManagementApi().explode(publicId, params: params)

|cli
cld uploader explode $public_id [$options]
```

### Required parameters
Parameter | Type| Description
 --- | --- | ---
public\_id | String | The identifier of the uploaded multi-page file (PDF or animated GIF). **Note**: The public ID for images does not include a file extension.
transformation | String | A transformation to run on all the pages before storing them as derived images. This parameter is given as a comma-separated list of transformations, and separated with a slash for chained transformations. At minimum, you must pass the `page` transformation with the value `all`. If you supply additional transformations, you must deliver the image using the same relative order of the `page` and the other transformations. If you use a different order when you deliver, then it is considered a different transformation, and will be generated on the fly as a new derived image.**SDKs**: Supports a hash of transformation parameters (or an array of hashes for chained transformations). **Note**: When using the SDK for a dynamically typed language, the transformation parameters can be specified directly without using this `transformation` parameter, as seen in the examples for Ruby, PHP, Python, and Node.js below.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type| Description
 --- | --- | ---
type | String | The specific file type of the asset. Valid values: `upload`, `private` and `authenticated`. **Default**: `upload`.
format | String | An optional format to convert the images before storing them in your Cloudinary product environment. **Default**: `png`.
notification_url | String | An HTTP or HTTPS URL to [notify](notifications) your application (a webhook) when the process has completed.

### Example
To explode a PDF file with the public ID of "sample":

```multi
|ruby
result = Cloudinary::Uploader
.explode('sample', 
  page: 'all')

|php_2
$result = $cloudinary->uploadApi()
->explode('sample', 
  ['page' => 'all']);

|python
result = cloudinary.uploader\
.explode("sample", 
	page = "all")

|nodejs
cloudinary.v2.uploader
.explode('sample', 
  { page: 'all'})
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.explode("sample",
  ObjectUtils.asMap("transformation", new Transformation().page("all"));

|csharp
var explodeParams = new ExplicitParams("sample", new Transformation().Path("all"));
var explodeResult = cloudinary.Explode(explodeParams); 

|go
resp, err := cld.Upload.Explode(ctx, uploader.ExplodeParams{
    PublicID: "sample_pdf", 
    Transformation: "pg_all"})

|swift
let transform = CLDTransformation().setPage("all")
let result = cloudinary.createManagementApi().explode("sample", transformation: transform)

|curl
curl https://api.cloudinary.com/v1_1/demo/image/explode -X POST --data 'public_id=sample&transformation=pg_all&timestamp=173719931&api_key=436464676&signature=a788d68f86a6f868af' 

|cli
cld uploader explode "sample" page="all"
```

### Sample response
The following is a sample response indicating that the `explode` command is in process.

```json
{
  "status": "processing",
  "batch_id": "4e485321b4a6f9692089cf40ab9aaa255b92afd8ecc17e1d415ae0a29dd31c42dc0b9139214ff488bba9ec8329482903"
}
```

---

## generate_archive

Run in Postman
Learn more about running Postman collections

Creates an archive file that contains all the assets meeting specified tag, public ID, or prefix criteria (or a combination thereof). 

You can perform different operations with the `generate_archive` endpoint by setting the value of the `mode` parameter to `download`, `create`, or `create_and_download`. **SDKs:** The Cloudinary SDKs wrap the `generate_archive` endpoint and offer separate methods for the supported operations.

The assets are added to the archive as files with their display names as follows: 

* **If only one transformation (or no transformations) is applied**, the asset files are stored with their display names only.
* **If more than one transformation is applied using a pipe-separated list**:
  * A derived asset is created for each asset in the archive and for each specified transformation.
  * Depending on the settings of the `skip_transformation_name` parameter, the transformation or a numeric value is appended to the file name to differentiate the assets derived from the same original using different transformations.
  * Depending on the settings of the `flatten_transformations` parameter, asset files derived from the same original may be stored in separate folders named after the original asset’s display name.

> **NOTE**: If your product environment uses the legacy [fixed folder](folder_modes) mode, the assets are stored in the archive with their public IDs instead of display names. 

The archive can contain up to 1000 different assets, and up to 5000 files if adding different derived versions of those assets using transformations. The maximum archive file size is the larger of 100 MB or your product environment's `raw` file size limit. 

> **READING**: :no-icon title=Important note for free accounts

By default, while you can still use this method to generate archive files, Free accounts are blocked from delivering **zip**, **rar**, **tagz**, and other archive formats for security reasons. For details, see [Media delivery](image_delivery_options#blocked_delivery_formats_for_security).

The Cloudinary SDKs wrap the `generate_archive` REST API method and offer several related helper methods: 

* [create_zip](#create_zip_syntax): generates a ZIP file based on the specified parameter values, uploads the file to your Cloudinary product environment, returns a JSON response with the URLs for accessing the ZIP file, and can then be delivered like any other [raw file uploaded to Cloudinary](upload_parameters#uploading_non_media_files_as_raw_files).
* [create_archive](#create_archive_syntax): generates an archive file based on the specified parameter values (default target_format = zip), uploads the file to your Cloudinary product environment, returns a JSON response with the URLs for accessing the archive file, and can then be delivered like any other [raw file uploaded to Cloudinary](upload_parameters#uploading_non_media_files_as_raw_files). 
* [download_zip_url](#download_zip_url_syntax) (`downloadZip` in Java, `DownloadArchiveUrl` in .NET): generates a signed URL that expires after 1 hour (by default). The URL can be accessed to dynamically create and then download a ZIP file based on the specified parameter values. The resulting ZIP file is not cached or stored in your Cloudinary product environment.
* [download_archive_url](#download_archive_url_syntax) (`downloadArchive` in Java): generates a signed URL that expires after 1 hour (by default). When the URL is invoked, it dynamically creates and downloads an archive file based on the given parameter values. The resulting archive file is not cached or stored in your Cloudinary product environment.
* [download_folder](#download_folder_syntax): generates a signed URL representing the contents of the specified folder (and its sub-folders). By default, the URL expires after 1 hour and includes all assets from the requested folder regardless of `resource_type`. When this folder URL is invoked, it dynamically creates and downloads an archive file with the folder contents. The resulting archive file is not cached or stored in your Cloudinary product environment.

> **NOTE**:
>
> If the archive generation requires creating derived assets and the size of the original resource is too big, the operation fails. Depending on your account setup, the following occurs:

> * When performing a `create` action, the operation fails and returns a `400` error.

> * When performing a `download` action, the file downloads, but the archive includes an `ERROR.txt` file, explaining the issue. 
> To avoid these issues, generate the derived assets using [eager](eager_and_incoming_transformations#eager_transformations) transformations with the [upload](#upload) or [explicit](#explicit) endpoints before attempting to generate the archive.

### create_zip syntax
`POST /:resource_type/generate_archive`

```multi
|ruby 
Cloudinary::Uploader.create_zip(options = {})
  
|php_2
$cloudinary->uploadApi()->createZip($options = []);

|python
cloudinary.uploader.create_zip(**options)

|nodejs
cloudinary.v2.uploader.create_zip(options).then(callback);
  
|java
cloudinary.uploader().createZip(Map options);

|csharp
cloudinary.CreateZip(ArchiveParams params);

|go
resp, err := cld.Upload.CreateZip(ctx, uploader.CreateArchiveParams{})

|cli
cld uploader create_zip $options
```

### create_archive syntax
`POST /:resource_type/generate_archive`

```multi
|ruby 
Cloudinary::Uploader.create_archive(options = {}, target_format = nil)
  
|php_2
$cloudinary->uploadApi()->createArchive($options = [], $target_format = NULL);
 
|python
cloudinary.uploader.create_archive(**options)

|nodejs
cloudinary.v2.uploader.create_archive(options, target_format = null).then(callback);
  
|java
cloudinary.uploader().createArchive(Map options);
-Or-
createArchive(Map options, String targetFormat);

|csharp
cloudinary.CreateArchive(ArchiveParams params);

|go
resp, err := cld.Upload.CreateArchive(ctx, uploader.CreateArchiveParams{})

|cli
cld uploader create_archive $options
```

### download\_zip\_url syntax
`POST /:resource_type/generate_archive`

```multi
|ruby 
Cloudinary::Utils.download_zip_url(options = {})
  
|php_2
$cloudinary->uploadApi()->downloadZipUrl($options = []);

|python
cloudinary.utils.download_zip_url(**options)

|nodejs
cloudinary.v2.utils.download_zip_url(options);
  
|java
cloudinary.downloadZip(Map options);

|csharp
cloudinary.DownloadArchiveUrl(ArchiveParams params);

|go
resp, err := cld.Upload.DownloadZipURL(uploader.CreateArchiveParams{})

|cli
cld utils download_zip_url $options
```

### download\_archive\_url syntax
`POST /:resource_type/generate_archive`

```multi
|ruby 
Cloudinary::Utils.download_archive_url(options = {})
  
|php_2
$cloudinary->uploadApi()->downloadArchiveUrl($options = []);
   
|python
cloudinary.utils.download_archive_url(**options)

|nodejs
cloudinary.v2.utils.download_archive_url(options);
  
|java
cloudinary.downloadArchive(Map options);

|csharp
cloudinary.DownloadArchiveUrl(ArchiveParams params);

|go
resp, err := cld.Upload.DownloadArchiveURL(uploader.CreateArchiveParams{})

|cli
cld utils download_archive_url $options
```

### download\_folder syntax
`POST /:resource_type/generate_archive`

```multi
|ruby 
Cloudinary::Utils.download_folder(folder_path, options = {})
  
|php_2
$cloudinary->uploadApi()->downloadFolder($folderPath, $options = []);

|python
cloudinary.utils.download_folder(folder_path, **options)

|nodejs
cloudinary.v2.utils.download_folder(folder_path, options);
  
|java
cloudinary.downloadFolder(String folder_path, Map options);

|csharp
cloudinary.DownloadFolder(string folderPath, ArchiveParams parameters);

|go
resp, err := cld.Upload.DownloadFolder(ctx, folder_path uploader.CreateArchiveParams{})

|cli
cld utils download_folder $folder_path $options
```

### Required parameters
At least one of the 'tags', 'public\_ids', or 'prefixes' parameters needs to be specified, in order to tell Cloudinary which assets to include in the archive file. Specifying any combination of the three parameters is also allowed - a unique union of all the matching assets will then be included in the archive file:

Parameter | Type| Description 
 --- | --- | ---
tags | String | A comma-separated list of tag names. All assets with the specified tags are included in the archive. Up to 20 tags are supported. For example: `animal,dog`**SDKs**: Supports arrays. For example: `['animal', 'dog']`
public\_ids | String | A comma-separated list of public IDs for the specific assets to be included in the archive. Up to 1000 public IDs are supported. **SDKs**: Supports arrays.
prefixes | String | A comma-separated list of prefixes of public IDs (e.g., folders). Setting this parameter to a slash (`/`) is a shortcut for including all assets in the product environment for the given `resource_type` and `type` (up to the max files limit). Up to 20 prefixes are supported.**SDKs**: Supports arrays.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type| Description
 --- | --- | ---
resource\_type  | String | The type of assets to include. Only relevant as a parameter when using the SDKs (the `resource_type` is included in the endpoint URL when using the REST API). Valid values: `image`, `raw`, `video`, `all`. **Default**: `image`. **Notes**: Use the `video` resource type to request video assets as well as for audio files, such as `.mp3`.When using the [download_folders](#download_folder_syntax) SDK method, the default is `all`.
type | String | The specific file type of assets to include in the archive (`upload`/`private`/`authenticated`). If tags are specified as a filter then all types are included. **Default**: `upload`.
transformations | String | Allows you to apply one or more transformations to all assets before storing them in the archive. (A single transformation is given as a comma-separated list of transformation parameters, and separated with a slash for chained transformations.) You can specify multiple transformations as a pipe (|) separated list. Each transformation will generate a separate derived asset for each original asset in the archive. For example, specifying `a_20|r_max` will result in two derived assets for each original—one at an angle and one rounded. If this parameter is not specified then the original assets are included in the archive. If you are including multiple asset types in your archive, make sure the transformations you specify are supported for all assets that will be included in the archive. **SDKs**: Supports a hash of transformation parameters (or an array of hashes for chained transformations).**Note**: When using the SDK for a dynamically typed language, the transformation parameters can be specified directly without using the `transformation` parameter.
mode | String |  (Only relevant when using the REST API - not for use with SDKs) Determines how to generate and deliver the archive: `download` - generates and delivers the archive file without storing it in your product environment.`create` - creates and stores it as a raw asset in your Cloudinary product environment (does not deliver the archive file itself, but returns a JSON response with the URLs for accessing the archive file).`create_and_download` - creates, stores AND delivers the archive file. **Default**: `create`.
target\_format | String |  (Only relevant when using the REST API or the 'archive' SDK methods - not for use with the 'zip' SDK methods)The format for the generated archive: `zip` or `tgz`. **Default**: `zip`.
target\_public\_id | String | The name to use for the generated file:  When the `mode` parameter is set to `create` (or when using one of the [create* SDK methods](#archive_sdk_methods)), this parameter defines the public ID to assign to the generated archive. When the `mode` parameter is set to `download` (or when using one of the [download* SDK methods](#archive_sdk_methods)), this parameter defines the filename of the downloaded archive file.If not specified, a random public ID (or download filename) is generated.
target\_asset\_folder | String | **Not supported for product environments using the legacy [fixed folder](folder_modes) mode and only for the [create* SDK methods](#archive_sdk_methods) / `create` mode.** The folder where the generated file is placed within the Cloudinary repository. **Default**: If not specified, the generated file will be located in the root of your product environment asset repository, even if the public ID value includes slashes.
flatten\_folders | Boolean | Determines whether to flatten all files to be in the root of the archive file (no sub-folders). Any folder information included in the public ID is stripped and a numeric counter is added to the file name in the case of a name conflict. **Default**: `false`.
flatten\_transformations  | Boolean | If multiple transformations are also applied, determines whether to flatten the folder structure of the derived assets. The transformation details are always stored on the file name. **Default**: `false`.
skip\_transformation\_name | Boolean | Determines whether to strip all transformation details from file names and add a numeric counter to a file name in the case of a name conflict. **Default**: `false`.
allow\_missing | Boolean | Allows generation of the archive if any of the supplied public IDs are not found, instead of returning an error. **Default**: `false`.
expires\_at | Integer |  (Only relevant when using the 'download' SDK methods and the 'download' mode in REST API calls) The date (UNIX time in seconds) for the URL expiration (e.g., 1415060076). **Default**: 1 hour from the time that the URL is generated.
use\_original\_filename  | Boolean | Whether to use the original file name of the included assets (if available) instead of the public ID. **Default**: `false`.
async  | Boolean | (Only relevant when using the 'create' SDK methods and the 'create' mode in REST API calls) Whether to perform the archive generation in the background (asynchronously). **Default**: `false`.
notification\_url | String |  (Only relevant when using the 'create' SDK methods and the 'create' mode in REST API calls) An HTTP or HTTPS URL to notify your application (a webhook) when the archive creation process has completed. If not specified for create operations, the response is sent to the **Notification URL** (if defined) in the **Webhook Notifications** settings of your Cloudinary Console.
target\_tags | String |  (Only relevant when using the 'create' SDK methods and the 'create' mode in REST API calls) A comma-separated list  of tag names to assign to the generated archive. For example: `animal,dog`**SDKs**: Supports arrays. For example: `['animal', 'dog']`
keep\_derived  | Boolean | Whether to keep the derived assets used for generating the archive. **Default**: `false.` 

### Examples
To create a zip file that contains all images that have the `lion` tag:

```multi
|ruby
result = Cloudinary::Uploader
.create_zip(
  tags: 'lion', 
  resource_type: 'image')

|php_2
$result = $cloudinary->uploadApi()
->createZip([
    'tags' => 'lion', 
    'resource_type' => 'image']);

|python
result = cloudinary.uploader\
.create_zip(
  tags = "lion", 
  resource_type = "image")

|nodejs
cloudinary.v2.uploader
.create_zip(
  { tags: 'lion', 
    resource_type: 'image'})
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.createZip(
  ObjectUtils.asMap(
    'tags', 'lion', 
    'resource_type', 'image'));

|csharp
var archiveParams = new ArchiveParams(){
  ResourceType = "image",
  Tags = "lion"};
var archiveResult = cloudinary.CreateZip(archiveParams); 

|go
resp, err := cld.Upload.CreateZip(ctx, uploader.CreateArchiveParams{
    ResourceType: "image", 
    Tags: []string{"lion"}})

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/generate_archive -X POST --data 'tags=lion&resource_type=image&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af' 

|cli
cld uploader create_zip tags="lion" resource_type="image"
```

To generate a URL for downloading a zip file that contains the images with the following public_ids: `dog`, `cat` and `lion`:

```multi
|ruby
result = Cloudinary::Utils
.download_zip_url(
  public_ids: ['dog','cat','lion'], 
  resource_type: 'image')

|php_2
$result = $cloudinary->uploadApi()
->downloadZipUrl([
  'public_ids' => ['dog', 'cat', 'lion'], 
  'resource_type' => 'image']);

|python
result = cloudinary.utils\
.download_zip_url(
  public_ids = ["dog","cat","lion"], 
  resource_type = "image")

|nodejs
result = cloudinary.v2.utils
.download_zip_url(
  { public_ids: ['dog','cat','lion']});

|java
result = cloudinary
.downloadZip(
  ObjectUtils.asMap(
    'public_ids', Arrays.asList('dog', 'cat', 'lion'), 
    'resource_type', 'image'));

|csharp
var archiveParams = new ArchiveParams(){
  ResourceType = "image",
  PublicIds = new List<string>(){"dog", "cat", "lion"}};
string url = cloudinary.DownloadArchiveUrl(archiveParams); 

|go
resp, err := cld.Upload.DownloadZipURL(uploader.CreateArchiveParams{
    PublicIDs: []string{"dog", "cat", "lion"}, 
    ResourceType: "image"})

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/generate_archive -X POST --data 'public_ids[]=dog&public_ids[]=cat&public_ids[]=lion&resource_type=image&mode=download&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af' 

|cli
cld utils download_zip_url public_ids='["dog","cat","lion"]' resource_type="image"
```

To generate a URL, that when accessed will download a zip file called `MyFolder.zip`, which contains all assets from the `MyFavoriteFolder` folder (and its sub-folders), regardless of `resource_type`:

```multi
|ruby
result = Cloudinary::Utils
.download_folder('MyFavoriteFolder', { target_public_id: "MyFolder" })

|php_2
$result = $cloudinary->uploadApi()
->downloadFolder('MyFavoriteFolder', ['target_public_id' => 'MyFolder']);

|python
result = cloudinary.utils\
.download_folder("MyFavoriteFolder", "target_public_id" = "MyFolder")

|nodejs
result = cloudinary.v2.utils
.download_folder('MyFavoriteFolder', {target_public_id: 'MyFolder'});

|java
result = cloudinary
.downloadFolder("MyFavoriteFolder",
  ObjectUtils.asMap("target_public_id","MyFolder"));

|csharp
var targetFilename = new ArchiveParams().TargetPublicId("MyFolder");
var folderUrl = cloudinary.DownloadFolder("MyFavoriteFolder", targetFilename);

|go
resp, err := cld.Upload.DownloadFolder("MyFavoriteFolder", uploader.CreateArchiveParams{
    TargetPublicID: "MyFolder"})

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/all/downloadFolder -X POST --data 'prefixes=MyFavoriteFolder&target_public_id=MyFolder&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af'

|cli
cld utils download_folder "MyFavoriteFolder" target_public_id=MyFolder
```

### Sample response
The following is a sample response based on the `create_zip` example above. 6 image assets with the tag 'lion' were added to the zip file. Because no `target_public_id` was specified in the upload, a random `public_id` was assigned to the zip file.

```json
{
  "asset_id": "1d67352b4deb6fcbecb1b475ea586ac8",
  "public_id": "lplcxtuftcgapvxfhy9b.zip",
  "version": 1719320289,
  "version_id": "ad33f47f037d5c8cc8e1e417d807c642",
  "signature": "fddc736bffc206246f6c2ada68ad9b7d7e521912",
  "resource_type": "raw",
  "created_at": "2024-06-25T12:58:09Z",
  "tags": [],
  "bytes": 3574651,
  "type": "upload",
  "etag": "a4267f8f38aa25c8ddc31b7bd34ace38",
  "placeholder": false,
  "url": "http://res.cloudinary.com/cld-docs/raw/upload/v1719320289/lplcxtuftcgapvxfhy9b.zip",
  "secure_url": "https://res.cloudinary.com/cld-docs/raw/upload/v1719320289/lplcxtuftcgapvxfhy9b.zip",
  "asset_folder": "",
  "display_name": "lplcxtuftcgapvxfhy9b.zip",
  "resource_count": 6,
  "file_count": 6
}
```

---

## multi

Run in Postman
Learn more about running Postman collections

Creates a single animated image (GIF, PNG or WebP), video (MP4 or WebM) or PDF from all image assets with a specified tag or from a set of specified image URLs. 

Each asset becomes a single page or frame in the resulting animated image, video, or PDF, sorted alphabetically by their public ID. 

**Learn more**: [Creating animated images](creating_animated_images) | [Creating PDF files from images](create_pdf_files_from_images)

> **READING**: :no-icon :title=Important note for free accounts

By default, while you can use this method to generate PDF files, Free accounts are blocked from delivering files in PDF format for security reasons. For details, see [Media delivery](image_delivery_options#blocked_delivery_formats_for_security).

### Syntax
`POST /image/multi`

```multi
|ruby 
Cloudinary::Uploader.multi(tag or urls, options = {})
  
|php_2
$cloudinary->uploadApi()->multi($tag or $urls, $options = []);
 
|python
cloudinary.uploader.multi(tag or urls, **options)

|nodejs
cloudinary.v2.uploader.multi(tag or urls, options).then(callback);
  
|java
cloudinary.uploader().multi(String tag or Array urls, Map options);

|csharp
cloudinary.Multi(MultiParams params); 

|swift
cloudinary.createManagementApi().multi(tag or urls, params: params)

|go
resp, err := cld.Upload.Multi(ctx, uploader.MultiParams{})

|cli
cld uploader multi $tag or $urls $options
```

### Required parameters
Parameter | Type| Description
 --- | --- | ---
tag | String | (Required if not using `urls`) The animated GIF or PDF is created from all images with this tag.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type| Description
 --- | --- | ---
urls | Array | (Required if not using `tag`) The animated GIF or PDF is created from all image URLs in the array.
transformation | String | A transformation to run on all the derived assets before creating the animated image or PDF. This parameter is given as a comma-separated list of transformations, and separated with a slash for chained transformations. **SDKs**: Supports a hash of transformation parameters (or an array of hashes for chained transformations).**Behavior differs for video formats** If the requested output format is a video (`mp4`, `webm`), the transformation behaves differently: - The source images are first combined into a video. - The specified transformation is then applied as a video transformation, not an image transformation. - Some image transformation capabilities are not supported or may not behave as expected in this context.For example, advanced transformations such as: - `g_auto` (automatic gravity) - `c_auto` (automatic cropping) - `dpr_auto`, `q_auto` (automatic DPR or quality) - `f_auto` (automatic format) are designed for individual image optimization and do not apply correctly to video transformations.**Note**: When using the SDK for a dynamically typed language, the transformation parameters can be specified directly without using the `transformation` parameter.
async | Boolean | Tells Cloudinary whether to perform the animated image or PDF generation in the background (asynchronously). **Default**: `false`.
format | String | The file format of the result. Valid values: `gif`, `png`, `webp`, `mp4`, `webm` and `pdf`. **Default**: `gif`
delay | Integer | The delay in milliseconds between frames. Valid for animated images and video formats.
notification\_url | String | An HTTP or HTTPS URL to notify your application (a webhook) when the process has completed. If not specified, the response is sent to the **Notification URL** (if defined) in the **Webhook Notifications** settings of your Cloudinary Console.

### Examples
Generating an animated GIF from all images tagged with `logo`:

```multi
|ruby
result = Cloudinary::Uploader
.multi('logo')

|php_2
$result = $cloudinary->uploadApi()
->multi('logo');

|python
result = cloudinary.uploader\
.multi("logo")

|nodejs
cloudinary.v2.uploader
.multi('logo')
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.multi('logo', ObjectUtils.emptyMap());

|csharp
var multiParams= new MultiParams("logo");
var multiResult = cloudinary.Multi(multiParams); 

|go
resp, err := cld.Upload.Multi(ctx, uploader.MultiParams{Tag: "logo"})

|curl
curl https://api.cloudinary.com/v1_1/demo/image/multi -X POST --data 'tag=logo&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af' 

|swift
let result = cloudinary.createManagementApi().multi("logo")

|cli
cld uploader multi "logo"
```

Generating an animated webp from all images tagged with `logo`: 

```multi
|ruby
result = Cloudinary::Uploader
.multi('logo', 
  format: 'webp')

|php_2
$result = $cloudinary->uploadApi()
->multi('logo', [
	"format" => "webp"]);

|python
result = cloudinary.uploader\
.multi("logo",
  format = "webp")

|nodejs
cloudinary.v2.uploader
.multi('logo', 
  {format: 'webp'})
.then(result=>console.log(result));

|java
result = cloudinary.uploader()
.multi("logo", 
  ObjectUtils.asMap("format", "webp"));

|csharp
var multiParams= new MultiParams("logo")
  {
    Format = "webp"
  };
var multiResult = cloudinary.Multi(multiParams); 

|go
resp, err := cld.Upload.Multi(ctx, uploader.MultiParams{
    Tag: "logo", 
    Format: "webp"})

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/multi -X POST --data 'tag=logo&format=webp&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af' 

|swift
let result = cloudinary.createManagementApi().multi("logo", format: "webp")

|cli
cld uploader multi "logo" format="webp"
```

Generating a PDF from a set of sample image URLs: 

```multi
|ruby
result = Cloudinary::Uploader
.multi(urls: ['https://res.cloudinary.com/demo/image/upload/cld-sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg'], 
  format: 'pdf')

|php_2
$result = $cloudinary->uploadApi()
->multi("urls" => ['https://res.cloudinary.com/demo/image/upload/cld-sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg'],
  "format" => "pdf");

|python
result = cloudinary.uploader\
.multi(urls=['https://res.cloudinary.com/demo/image/upload/cld-sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg'],
  format = 'pdf')

|nodejs
cloudinary.v2.uploader
.multi({urls: ['https://res.cloudinary.com/demo/image/upload/cld-sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg'
  ], format: "pdf"})
.then(result=>console.log(result));

|java
String[] urls = new String[]{'https://res.cloudinary.com/demo/image/upload/cld-sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg'};
result = cloudinary.uploader()
.multi(urls, 
  ObjectUtils.asMap("format", "pdf"));

|csharp
var urls = new List<string> { 'https://res.cloudinary.com/demo/image/upload/cld-sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg' };
var multiParams= new MultiParams(urls)
  {
    Format = "pdf"
  };
var multiResult = cloudinary.Multi(multiParams); 

|go
Not supported by this SDK 

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/multi -X POST --data 'urls[]=https://res.cloudinary.com/demo/image/upload/cld-sample.jpg&urls[]=https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg&urls[]=https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg&format=pdf&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af' 

|swift
Not supported by this SDK 

|cli
cld uploader multi urls=['https://res.cloudinary.com/demo/image/upload/cld-sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg',
  'https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg'], format="pdf"
```

### Sample response
The following is a sample response based on the logo example above. An animated `logo.webp` image was created from all the images with the tag `logo`.

```json
{
  "url": "http://res.cloudinary.com/cld-docs/image/multi/f_webp/v1719321316/logo.webp",
  "secure_url": "https://res.cloudinary.com/cld-docs/image/multi/f_webp/v1719321316/logo.webp",
  "asset_id": "fa441e2c3968794333afd86663c7936f",
  "public_id": "logo,webp,f_webp",
  "version": 1719321316
}
```

---

## sprite (deprecated)
A sprite is a single image made up of many smaller images, historically used to reduce the number of HTTP requests on web pages. While this strategy was once frequently used, it’s no longer commonly recommended.> **INFO**:
>
> The **Sprite** feature will be deprecated as of **September 16, 2025**, and will no longer function after that date. Be sure to remove it from any production code.
For better long-term performance, use techniques like [lazy loading](advanced_image_components_tutorial#lazy_loading), [responsive images](responsive_images), or [overlays](image_transformations#adding_image_overlays) to achieve similar goals with modern best practices.

## text

Run in Postman
Learn more about running Postman collections

Dynamically generates an image from a specified text string. 

You can deliver and transform the returned textual image like any other image, for example, as an overlay for other images. You can specify various font, color, and style parameters to customize the look and feel of the text before converting it to an image.

### Syntax
`POST /image/text`

```multi
|ruby 
Cloudinary::Uploader.text(text, options = {})
  
|php_2
$cloudinary->uploadApi()->text($text, $options = []);

|python
cloudinary.uploader.text(text, **options)

|nodejs
cloudinary.v2.uploader.text(text, options, callback);
  
|java
cloudinary.uploader().text(String text, Map options);

|csharp
cloudinary.Text(TextParams params); 

|go
resp, err := cld.Upload.Text(ctx, uploader.TextParams{})

|swift
cloudinary.createManagementApi().text(text, params: params)

|endpoint
https://api.cloudinary.com/v1_1/<cloud_name>/image/text

|cli
cld uploader text $text [$options]
```

### Required parameters
Parameter | Type | Description
 --- | --- | ---
text | String | The text string to generate an image for.
signature | String | (Required for signed REST API calls) Used to authenticate the request and based on the parameters you use in the request. When using the Cloudinary SDKs for signed requests, the signature is automatically generated and added to the request. If you manually generate your own signed POST request, you need to manually generate the `signature` parameter and add it to the request together with the `api_key` and `timestamp` parameters. For more details, see [manually generating signatures](authentication_signatures).
### Optional parameters
Parameter | Type | Description
 --- | --- | ---
public\_id | String | The identifier that is used for accessing the generated image. If not specified, a unique identifier is generated by Cloudinary. **Note**: The public ID value for images and videos should not include a file extension. Include the file extension for `raw` files only. 
font\_family | String | The name of the font family.
font\_size | Integer | Font size in points. **Default**: `12`.
font\_color | String | Name or RGB representation of the font's color. For example: `red` or `#ff0000`. **Default**: `black`.
font\_weight | String |  Whether to use a `normal` or a `bold` font. **Default**: `normal`.
font\_style | String |  Whether to use a `normal` or an `italic` font. **Default**: `normal`.
background | String |  Name or RGB representation of the background color of the generated image. For example: `red` or `#ff0000`. **Default**: `transparent`.
opacity | Integer |  Text opacity value between 0 (invisible) and 100. **Default**: `100`.
text\_decoration | String |  Set to `underline` to define a line below the text. **Default**: `none`.

### Example
Create an image of the text string "Sample text string" in 42 point, red, Roboto bold font, and the public ID of "sample\_text\_image":

```multi
|ruby
result = Cloudinary::Uploader
.text("Sample text string",
  public_id: "sample_text_image",
  font_family: "Roboto", 
  font_size: 42,
  font_color: "red",
  font_weight: "bold")

|php_2
$result = $cloudinary->uploadApi()
->text("Sample text string", [
	"public_id" => "sample_text_image",
	"font_family" => "Roboto", 
	"font_size" => 42,
	"font_color" => "red", 
	"font_weight" => "bold"]);

|python
result = cloudinary.uploader
.text("Sample text string",
  public_id = "sample_text_image",
  font_family = "Roboto", 
  font_size = 42,
  font_color = "red",
  font_weight = "bold")

|nodejs
cloudinary.v2.uploader
.text("Sample text string",
  { public_id: "sample_text_image",
	font_family: "Roboto", 
	font_size: 42,
	font_color: "red", 
	font_weight: "bold" })
.then(result=>console.log(result));
         
|java
result = cloudinary.uploader
.text("Sample text string",
  ObjectUtils.asMap(
    "public_id", "sample_text_image",
	"font_family", "Roboto",
	"font_size", 42,
	"font_color", "red",
	"font_weight", "bold"));

|csharp
var textParams = new TextParams("Sample text string"){
  PublicId = "sample_text_image",
  FontFamily = "Roboto",
  FontSize = 42,
  FontColor = "red",
  FontWeight= "bold"};
var textResult = cloudinary.Text(textParams); 

|go
resp, err := cld.Upload.Text(ctx, uploader.TextParams{
        Text: "Sample text string",
		PublicID:   "sample_text_image",
		FontFamily: "Roboto",
		FontSize:   42,
		FontColor:  "red",
		FontWeight: "bold"})

|swift
let params = CLDTextRequestParams()
  .setPublicId("sample_text_image")
  .setFontFamily("Roboto")
  .setFontSize("42")
  .setFontColor("red")
  .setFontWeight(.bold)
let result = cloudinary.createManagementApi().multi("Sample text string", params: params)

|curl
curl https://api.cloudinary.com/v1_1/cld-docs/image/text -X POST --data 'text=Sample%20text%20string&public_id=sample_text_image&font_family=Roboto&font_size=42&font_color=red&font_weight=bold&timestamp=173719931&api_key=614335564976464&signature=a788d68f86a6f868af' 

|cli
cld uploader text "Sample text string" public_id="sample_text_image" font_family="Roboto" font_size=42 font_color="red" font_weight="bold"
```
### Sample response
The following is a sample response based on the example above. A text image is created with the public ID `sample_text_image` based on the transformations requested in the `text` method.

```json
{
  "asset_id": "61ddb767702ba3ddfa001a9b7ffde34b",
  "public_id": "sample_text_image",
  "version": 1719322344,
  "version_id": "b16e766d3dc9bb643621785807a83ba9",
  "signature": "d5a1e11f75ae4041c26edd1b90e590d45160579e",
  "width": 342,
  "height": 41,
  "format": "png",
  "resource_type": "image",
  "created_at": "2024-06-25T13:32:24Z",
  "tags": [],
  "bytes": 3668,
  "type": "text",
  "etag": "6d30c424f1ac7df3057dba05efd5e511",
  "placeholder": false,
  "url": "http://res.cloudinary.com/cld-docs/image/text/v1719322344/sample_text_image.png",
  "secure_url": "https://res.cloudinary.com/cld-docs/image/text/v1719322344/sample_text_image.png",
  "asset_folder": "",
  "display_name": "sample_text_image"
}
```

