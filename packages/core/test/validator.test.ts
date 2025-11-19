import { describe, expect, it } from 'bun:test';
import { validate } from '../src/validators/json-schema';
import type { ValidationSchema } from '../src/types';

describe('Validator', () => {
    it('should validate string type', () => {
        const schema: ValidationSchema = { type: 'string' };
        expect(validate('test', schema).valid).toBe(true);
        expect(validate(123, schema).valid).toBe(false);
    });

    it('should validate number type', () => {
        const schema: ValidationSchema = { type: 'number' };
        expect(validate(123, schema).valid).toBe(true);
        expect(validate('test', schema).valid).toBe(false);
    });

    it('should validate boolean type', () => {
        const schema: ValidationSchema = { type: 'boolean' };
        expect(validate(true, schema).valid).toBe(true);
        expect(validate('true', schema).valid).toBe(false);
    });

    it('should validate array type', () => {
        const schema: ValidationSchema = { type: 'array' };
        expect(validate([], schema).valid).toBe(true);
        expect(validate({}, schema).valid).toBe(false);
    });

    it('should validate object type', () => {
        const schema: ValidationSchema = { type: 'object' };
        expect(validate({}, schema).valid).toBe(true);
        expect(validate([], schema).valid).toBe(false);
        expect(validate(null, schema).valid).toBe(false);
    });

    it('should validate required fields', () => {
        const schema: ValidationSchema = {
            type: 'object',
            required: ['name']
        };
        expect(validate({ name: 'John' }, schema).valid).toBe(true);
        expect(validate({ age: 30 }, schema).valid).toBe(false);
    });

    it('should validate properties', () => {
        const schema: ValidationSchema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                age: { type: 'number' }
            }
        };
        expect(validate({ name: 'John', age: 30 }, schema).valid).toBe(true);
        expect(validate({ name: 123 }, schema).valid).toBe(false);
    });

    it('should validate nested properties', () => {
        const schema: ValidationSchema = {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' }
                    }
                }
            }
        };
        expect(validate({ user: { name: 'John' } }, schema).valid).toBe(true);
        expect(validate({ user: { name: 123 } }, schema).valid).toBe(false);
    });

    it('should validate array items', () => {
        const schema: ValidationSchema = {
            type: 'array',
            items: { type: 'number' }
        };
        expect(validate([1, 2, 3], schema).valid).toBe(true);
        expect(validate([1, '2'], schema).valid).toBe(false);
    });

    it('should validate number constraints', () => {
        const schema: ValidationSchema = {
            type: 'number',
            minimum: 10,
            maximum: 20
        };
        expect(validate(15, schema).valid).toBe(true);
        expect(validate(5, schema).valid).toBe(false);
        expect(validate(25, schema).valid).toBe(false);
    });

    it('should validate string constraints', () => {
        const schema: ValidationSchema = {
            type: 'string',
            minLength: 2,
            maxLength: 5,
            pattern: '^[a-z]+$'
        };
        expect(validate('abc', schema).valid).toBe(true);
        expect(validate('a', schema).valid).toBe(false);
        expect(validate('abcdef', schema).valid).toBe(false);
        expect(validate('123', schema).valid).toBe(false);
    });

    it('should validate email format', () => {
        const schema: ValidationSchema = {
            type: 'string',
            format: 'email'
        };
        expect(validate('test@example.com', schema).valid).toBe(true);
        expect(validate('invalid-email', schema).valid).toBe(false);
    });
});
