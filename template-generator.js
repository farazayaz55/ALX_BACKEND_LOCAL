const fs = require('fs');
const path = require('path');

/**
 * Template Generator Script
 * Creates Fabric.js JSON files matching the exact structure of working templates (1-42)
 * Generates templates with full-size images and editable text elements
 */

class TemplateGenerator {
    constructor() {
        this.imgDir = path.join(__dirname, 'public', 'files', 'templates', 'img');
        this.jsonDir = path.join(__dirname, 'public', 'files', 'templates', 'json');
        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
        this.canvasWidth = 1414;
        this.canvasHeight = 2000;
    }

    // Get the next available template number
    getNextTemplateNumber() {
        try {
            const existingJsonFiles = fs.readdirSync(this.jsonDir)
                .filter(file => file.endsWith('.json'))
                .map(file => parseInt(file.replace('.json', '')))
                .filter(num => !isNaN(num))
                .sort((a, b) => b - a);
            
            return existingJsonFiles.length > 0 ? existingJsonFiles[0] + 1 : 1;
        } catch (error) {
            console.error('Error reading JSON directory:', error.message);
            return 43;
        }
    }

    // Convert image to base64 data URL
    imageToBase64(imagePath) {
        try {
            const imageBuffer = fs.readFileSync(imagePath);
            const ext = path.extname(imagePath).toLowerCase();
            let mimeType = 'image/jpeg';
            
            switch (ext) {
                case '.png': mimeType = 'image/png'; break;
                case '.webp': mimeType = 'image/webp'; break;
                case '.gif': mimeType = 'image/gif'; break;
                default: mimeType = 'image/jpeg';
            }
            
            return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        } catch (error) {
            console.error(`Error converting image to base64: ${error.message}`);
            return null;
        }
    }

    // Generate Fabric.js JSON template matching existing templates exactly
    generateTemplate(imagePath, templateNumber) {
        const base64Image = this.imageToBase64(imagePath);
        if (!base64Image) return null;

        // Standard canvas size used by all templates
        const width = this.canvasWidth;
        const height = this.canvasHeight;
        
        // Create template matching exact structure of templates 1-42
        const template = {
            "version": "4.6.0",
            "objects": [
                // Heading textbox (top center)
                {
                    "type": "textbox",
                    "version": "4.6.0",
                    "originX": "center",
                    "originY": "center",
                    "left": 540,
                    "top": 270,
                    "width": 540,
                    "height": 67.68,
                    "fill": "#ffffff",
                    "stroke": "#fff",
                    "strokeWidth": 0,
                    "strokeDashArray": null,
                    "strokeLineCap": "butt",
                    "strokeDashOffset": 0,
                    "strokeLineJoin": "miter",
                    "strokeUniform": false,
                    "strokeMiterLimit": 4,
                    "scaleX": 1,
                    "scaleY": 1,
                    "angle": 0,
                    "flipX": false,
                    "flipY": false,
                    "opacity": 1,
                    "shadow": null,
                    "visible": true,
                    "backgroundColor": "",
                    "fillRule": "nonzero",
                    "paintFirst": "fill",
                    "globalCompositeOperation": "source-over",
                    "skewX": 0,
                    "skewY": 0,
                    "erasable": false,
                    "fontFamily": "Montserrat",
                    "fontWeight": "bold",
                    "fontSize": 48,
                    "text": "Your Headline Here",
                    "underline": false,
                    "overline": false,
                    "linethrough": false,
                    "textAlign": "center",
                    "fontStyle": "normal",
                    "lineHeight": 1.2,
                    "textBackgroundColor": "rgba(0,0,0,0)",
                    "charSpacing": 0,
                    "styles": {},
                    "direction": "ltr",
                    "path": null,
                    "pathStartOffset": 0,
                    "pathSide": "left",
                    "minWidth": 20,
                    "splitByGrapheme": false,
                    "objectType": "textbox",
                    "gradientFill": "none",
                    "selectable": true,
                    "lockMovementX": false,
                    "lockMovementY": false,
                    "lockRotation": false
                },
                // Description textbox (bottom center)
                {
                    "type": "textbox",
                    "version": "4.6.0",
                    "originX": "center",
                    "originY": "center",
                    "left": 540,
                    "top": 810,
                    "width": 607.07,
                    "height": 111.42,
                    "fill": "#ffffff",
                    "stroke": "#fff",
                    "strokeWidth": 0,
                    "strokeDashArray": null,
                    "strokeLineCap": "butt",
                    "strokeDashOffset": 0,
                    "strokeLineJoin": "miter",
                    "strokeUniform": false,
                    "strokeMiterLimit": 4,
                    "scaleX": 1,
                    "scaleY": 1,
                    "angle": 0,
                    "flipX": false,
                    "flipY": false,
                    "opacity": 1,
                    "shadow": null,
                    "visible": true,
                    "backgroundColor": "",
                    "fillRule": "nonzero",
                    "paintFirst": "fill",
                    "globalCompositeOperation": "source-over",
                    "skewX": 0,
                    "skewY": 0,
                    "erasable": false,
                    "fontFamily": "Montserrat",
                    "fontWeight": "normal",
                    "fontSize": 29,
                    "text": "Add your description text here. This text can be edited and customized.",
                    "underline": false,
                    "overline": false,
                    "linethrough": false,
                    "textAlign": "center",
                    "fontStyle": "normal",
                    "lineHeight": 1.2,
                    "textBackgroundColor": "rgba(0,0,0,0)",
                    "charSpacing": 0,
                    "styles": {},
                    "direction": "ltr",
                    "path": null,
                    "pathStartOffset": 0,
                    "pathSide": "left",
                    "minWidth": 20,
                    "splitByGrapheme": false,
                    "objectType": "textbox",
                    "gradientFill": "none",
                    "selectable": true,
                    "lockMovementX": false,
                    "lockMovementY": false,
                    "lockRotation": false
                }
            ],
            "background": "#f5f5f5",
            "backgroundImage": {
                "type": "image",
                "version": "4.6.0",
                "originX": "left",
                "originY": "top",
                "left": 0,
                "top": 0,
                "width": width,
                "height": height,
                "fill": "rgb(0,0,0)",
                "stroke": null,
                "strokeWidth": 0,
                "strokeDashArray": null,
                "strokeLineCap": "butt",
                "strokeDashOffset": 0,
                "strokeLineJoin": "miter",
                "strokeUniform": false,
                "strokeMiterLimit": 4,
                "scaleX": 1,
                "scaleY": 1,
                "angle": 0,
                "flipX": false,
                "flipY": false,
                "opacity": 1,
                "shadow": null,
                "visible": true,
                "backgroundColor": "",
                "fillRule": "nonzero",
                "paintFirst": "fill",
                "globalCompositeOperation": "source-over",
                "skewX": 0,
                "skewY": 0,
                "erasable": true,
                "cropX": 0,
                "cropY": 0,
                "objectType": "BG",
                "mode": "canvas",
                "selectable": false,
                "lockMovementX": true,
                "lockMovementY": true,
                "lockRotation": true,
                "crossOrigin": null,
                "src": base64Image
            }
        };

        return template;
    }


    // Get list of images that don't have corresponding JSON files
    getNewImages() {
        try {
            const imageFiles = fs.readdirSync(this.imgDir)
                .filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return this.supportedFormats.includes(ext);
                });

            const existingJsonFiles = fs.readdirSync(this.jsonDir)
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));

            // Find images that don't have corresponding JSON files
            const newImages = imageFiles.filter(imageFile => {
                const baseName = path.parse(imageFile).name;
                return !existingJsonFiles.includes(baseName);
            });

            return newImages;
        } catch (error) {
            console.error('Error reading directories:', error.message);
            return [];
        }
    }

    // Process all new images
    async processNewImages() {
        const newImages = this.getNewImages();
        
        if (newImages.length === 0) {
            console.log('✅ No new images found. All images have corresponding JSON files.');
            return;
        }

        console.log(`🔄 Found ${newImages.length} new images to process:`);
        newImages.forEach(img => console.log(`   - ${img}`));

        let nextNumber = this.getNextTemplateNumber();
        const results = [];

        for (const imageFile of newImages) {
            try {
                console.log(`\n🖼️  Processing: ${imageFile}`);
                const imagePath = path.join(this.imgDir, imageFile);
                const template = this.generateTemplate(imagePath, nextNumber);
                
                if (template) {
                    // Save JSON file
                    const jsonFileName = `${nextNumber}.json`;
                    const jsonPath = path.join(this.jsonDir, jsonFileName);
                    fs.writeFileSync(jsonPath, JSON.stringify(template));
                    
                    // Rename image file to match the number (maintain extension)
                    const currentExt = path.extname(imageFile);
                    const newImageName = `${nextNumber}${currentExt}`;
                    const newImagePath = path.join(this.imgDir, newImageName);
                    
                    // Only rename if the target doesn't exist
                    if (!fs.existsSync(newImagePath)) {
                        fs.renameSync(imagePath, newImagePath);
                        console.log(`✅ Created template ${nextNumber}: ${jsonFileName} and renamed image to ${newImageName}`);
                    } else {
                        console.log(`✅ Created template ${nextNumber}: ${jsonFileName} (image name unchanged to avoid conflict)`);
                    }
                    
                    results.push({
                        number: nextNumber,
                        image: newImageName,
                        json: jsonFileName,
                        success: true
                    });
                    
                    nextNumber++;
                } else {
                    console.log(`❌ Failed to process: ${imageFile}`);
                    results.push({
                        image: imageFile,
                        success: false,
                        error: 'Failed to generate template'
                    });
                }
            } catch (error) {
                console.error(`❌ Error processing ${imageFile}:`, error.message);
                results.push({
                    image: imageFile,
                    success: false,
                    error: error.message
                });
            }
        }

        // Summary
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`\n📊 Processing Summary:`);
        console.log(`   ✅ Successfully processed: ${successful} templates`);
        if (failed > 0) {
            console.log(`   ❌ Failed: ${failed} templates`);
        }
        console.log(`   🎯 Total templates now: ${nextNumber - 1}`);

        return results;
    }

    // Manual trigger to process images
    async run() {
        console.log('🚀 Template Generator Started');
        console.log(`📂 Image directory: ${this.imgDir}`);
        console.log(`📂 JSON directory: ${this.jsonDir}`);
        console.log(`📐 Canvas size: ${this.canvasWidth}x${this.canvasHeight}`);
        
        // Check if directories exist
        if (!fs.existsSync(this.imgDir)) {
            console.error(`❌ Image directory not found: ${this.imgDir}`);
            return;
        }
        
        if (!fs.existsSync(this.jsonDir)) {
            console.error(`❌ JSON directory not found: ${this.jsonDir}`);
            return;
        }
        
        await this.processNewImages();
        
        console.log('\n🎉 Template generation complete!');
    }
}

// CLI Usage
if (require.main === module) {
    const generator = new TemplateGenerator();
    generator.run();
}

module.exports = TemplateGenerator;
