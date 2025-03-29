"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeProperties = InitializeProperties;
/**
 * This is a utility decorator to help with TypeScript strict property initialization.
 * Use it on entity classes to avoid "Property has no initializer" errors.
 */
function InitializeProperties(constructor) {
    return class extends constructor {
        constructor(...args) {
            super(...args);
            // Initialize primitive properties to sensible defaults
            Object.getOwnPropertyNames(this).forEach(prop => {
                const descriptor = Object.getOwnPropertyDescriptor(this, prop);
                if (descriptor && descriptor.value === undefined) {
                    const type = typeof this[prop];
                    switch (type) {
                        case 'string':
                            this[prop] = '';
                            break;
                        case 'number':
                            this[prop] = 0;
                            break;
                        case 'boolean':
                            this[prop] = false;
                            break;
                        case 'object':
                            if (this[prop] instanceof Date) {
                                this[prop] = new Date();
                            }
                            else if (Array.isArray(this[prop])) {
                                this[prop] = [];
                            }
                            break;
                    }
                }
            });
        }
    };
}
//# sourceMappingURL=entity.decorator.js.map