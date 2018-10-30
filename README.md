Build status: [![CircleCI](https://circleci.com/gh/alsofronie/privatesky-validator/tree/master.svg?style=svg)](https://circleci.com/gh/alsofronie/privatesky-validator/tree/master)

# Object schema validator

This package validates an object definition against the declared types and, optionally, a set of validation rules.

## TODO's & wishlist

 - integrate [JSON-LD](https://json-ld.org/)

## General structure for objects to be validated

```
{
    "id": "integer",
    "name": "string"
}
```

## Data field definition

A data field is represented by it's name and it's definition. In the example above, the `id` has a type of `integer`. The validation is done only by verifying the type of the variable contents.

The following definitions are equivalent:

The shortened syntax:

```
{
    "id": "integer"
}
```

The extended syntax:

```
{
    "id": {
        "type": "integer"
    }
}
```

Further, some validation rules can be written, but only in extended syntax:

```
{
    "id": {
        "type": "integer",
        "min": 10,
        "max": 15
    }
}
```

The rules are applied in the order they appear, with the except of `nullable` rule (see below). If a rule is not satisfied, the code will break at that point and no rules will be further verified.

As a rule, no keys (like the `id` in the example above) cannot start with a `@`. This character is reserved. Also, do not use `*` as a name, because is also reserved (see below Validating arrays).

## Available types

### Primary types

These types are directly supported by JSON format and they should be received as is. The validator will make a difference between a value `346` and a value `"346"`, the last one failing the `integer` type validation. The primary types are:

 - `integer` - an integer number
 - `string`- a string with variable length
 - `float` - a floating point number
 - `bool` - a boolean value, represented by `true` or `false`
 - `array` - an array
 - `object` - a Javascript object

### Derived types

All the derived types are represented as strings or integers, having a hint on their format and domain:

 - `mixed` - any data can be stored in this variable type;
 - `date` - a string representation of date, in the format `YYYY-MM-DD`;
 - `datetime` - a string representation of date and time, in the format `YYYY-MM-DD HH:mm:ss`;
 - `timestamp` - an integer representation of a Javascript Timestamp (number of milliseconds since Jan 1st, 1970);
 - `unix` - an integer representation of an Unix Timestamp (number of seconds since Jan 1st, 1970);
 - `uuid` - The field under validation must be a valid RFC 4122 (version 1, 3, 4, or 5) universally unique identifier (UUID);

 > Warning: a type of `mixed` will not trigger a validation.

## Available validation rules

The validation rules further enforces the values and the formats of the supplied variable. But **always** the first rule is the `type`. If the type fails, no other rules will be verified. An exception is the `nullable` validation rule, which, if it is present, will be taken into account.

### Minimum rule: `min`

For `int` type, this rule will check if the supplied value is **greater or equal than** the argument supplied in the rule definition, which must be an integer.

For `string` type, the rule refers to the length of the string, being **greater or equal to** the argument supplied in the rule definition, which must be an integer.

For `array`, the rule refers to the length of the array.

For `date` type, the rule applies as **is after** the argument supplied in the rule definition, which must be a date formatted as `YYYY-MM-DD`

Similar concerns applies for `datetime` type, the format of the supplied argument being `YYYY-MM-DD HH:mm:ss`.

The same applies for `timestamp` and `unix` data types, with the corresponding argument types.

### Maximum rule: `max`

This rule is similar with the `min` rule. For example, in the case of the `int` type, the value will be checked to be **less or equal than** the rule argument.

For example, the definition below:

```
{
    "age": {
        "type": "integer",
        "min": 18,
        "max": 65
    }
}
```

will validate a value of `18` to `65`, but a value of `66` will fail validation.

### Exact rule: `exact`

This rule is a shorthand for `min` and `max` when the two values are equal. The following examples are equivalent:

Example with `min` and `max`

```
{
    "age": {
        "type": "integer",
        "min": 22,
        "max": 22
    },
    "basket": {
        "type": "array",
        "min": 10,
        "max": 10
    }
}
```

Equivalent example with `size`
```
{
    "age": {
        "type": "integer",
        "size": 22
    },
    "basket": {
        "type": "array",
        "size": 10
    }
}
```

### Alpha rule: `alpha`

This only refers to `string` type and checks to see if the string contains only letters.

### Alphanumeric rule: `alphanumeric`

This only refers to `string` type and checks to see if the string contains only letters and numbers.

### Digits rule: `digits`

This only refers to `string` type and checks if the string contains only numbers and signs (`+` and `-`)

### In rule: `in`

The `in` rule accepts an array of values with represent the valid domain for the value. The comparison is performed with **type checking** (as in `===` operator). For example, for the rule definition:

```
{
    "price": {
        "type": "float",
        "in": [22.99, 199.49, 3999.49]
    }
}
```

will pass validation for:

```
{
    "price": 199.49
}
```

but will fail for:

```
{
    "price": "199.49"
}
```

### Not In rule: `not_in`

This rule is the negation of `in` rule. The value should **not** be in the provided rule argyment.

### Regexp rule: `regexp`

This rule will check a `string` value for complying with the rule definition supplied argument, which must be a valid regexp, exactly as the one you would supply to `Regexp` Javascript object.

The syntax is:

```
{
    "name": {
        "type": "string",
        "regexp": "^[a-zA-Z0-9\.]+\s[a-zA-Z0-9\.]+*"
    }
}
```

If you also need the flags (like `g`, `i`), the syntax is:

```
{
    "name": {
        "type": "string",
        "regexp": {
            "pattern": "^[a-z0-9\.]+\s[a-z0-9\.]+*$",
            "flags": "im"
        }
    }
}
```

### Required rule: `required`

This rule implies a non-empty value to be present.

For integers, the value must be non-zero. For strings, an empty string `""` will not pass the validation. For arrays, an empty array `[]` will also not pass the validation.

Please note that a boolean value of `false` will not pass the validation.

By default, all the rules contains `required` set to false.

### Nullable rule: `nullable`

This rule will permit any variable (of any type) to hold a `null` value. The value must be represented as `null` in JSON, like:

```
{
    "age": null
}
```

and not `"null"` (string) or any other nullable representation. Note that an empty array will not be treated as null.

The rule accepts a boolean (`true` or `false`) as argument.

By default, **all variables** have this rule with `false`, so the following definitions are equivalent:

With explicit `nullable`:

```
{
    "file_id": {
        "type": "array",
        "nullable": false
    }
}
```

Without explicit `nullable`, extended syntax:

```
{
    "file_id": {
        "type": "array"
    }
}
```

Without explicit `nullable`, shortened syntax:

```
{
    "file_id": "array"
}
```

So, it makes no sense to set `nullable` to false, but the validator will not complain. Of course, you can specify it to be more exact in your source code :).

The real thing comes with the `nullable` set to `true` in your validation rules. This will always be **the first rule checked**, even before the type. If the value is `null`, the validator will be satisfied. If not, the `type` is checked and, after it passes, all the other validation rules, in the provided order.

A special case is when both `nullable` and `required` are specified with `true` as argument. In this case, the given variable must be non-empty only if it is not null.

## Validating arrays

A special syntax is for validating not only an array to be an array, but also it's values.

For example, we need to validate an array of values representing ages, which can be integers between 18 and 25 and they must be at least 3 elements in array and 10 at most. In this case, the validation will look like this:

```
{
    "ages": {
        "type": "array",
        "min": 3,
        "max": 10,
        "*": {
            "type": "integer",
            "min": 18,
            "max": 26
        }
    }
}
```

## Validating objects

Another special case is for validating an object structure. For example let's presume we need to validate a Javascript object containing a person's information: name, age, sex and occupation. Further more, the name is a required string, the age must be an integer over 18, and the occupation must be a string no more than 255 characters. A description is an optional string (as an example for mixing the shorter with the extended syntax). The rule will look like this:

```
{
    "person": {
        "type": "object",
        "*": {
            "name": {
                "type": "string",
                "required": true
            },
            "age": {
                "type": "integer",
                "min": 18,
            },
            "occupation": {
                "type": "string",
                "max": 255
            },
            "description": "string"
        }
    }
}
```

For validating array of objects (for example, an array of persons), the following syntax is allowed:

```
{
    "persons": {
        "type": "array",
        "*": {
            "type": "object",
            "*": {
                "name": {
                    "type": "string",
                    "required": true
                },
                "age": {
                    "type": "integer",
                    "min": 18,
                },
                "occupation": {
                    "type": "string",
                    "max": 255
                },
                "description": "string"
            }
        }
    }
}
```

There is no limit for this depth. You can easily extend the example above for an array of persons in which every person has instead of a string, an array of occupations (let's say it's an array of UUIDs with a minimum of one occupation:

```
{
    "persons": {
        "type": "array",
        "*": {
            "type": "object",
            "*": {
                "name": {
                    "type": "string",
                    "required": true
                },
                "age": {
                    "type": "integer",
                    "min": 18,
                },
                "occupations": {
                    "type": "array",
                    "min": 1,
                    "*": {
                        "type": "string",s
                    }
                },
                "description": "string"
            }
        }
    }
}
```

For putting it simpler, the `*` character stands for **every element of the array** or **the property of the object**. There is no need to point out that the `*` character will be ignored for non-array and non-object types and **it should not be used**.
