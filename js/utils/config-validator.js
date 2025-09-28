// ConfigValidator - 設定検証ユーティリティ
// 設定オブジェクトのバリデーションとデフォルト値の適用を提供

const ConfigValidator = {
  // デフォルトの検証ルール
  DEFAULT_RULES: {
    number: {
      type: 'number',
      validate: (value, rule) => {
        if (typeof value !== 'number') {
          return { valid: false, error: 'number' };
        }
        if (rule.min !== undefined && value < rule.min) {
          return { valid: false, error: 'min' };
        }
        if (rule.max !== undefined && value > rule.max) {
          return { valid: false, error: 'max' };
        }
        return { valid: true };
      }
    },
    string: {
      type: 'string',
      validate: (value, rule) => {
        if (typeof value !== 'string') {
          return { valid: false, error: 'type' };
        }
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          return { valid: false, error: 'minLength' };
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          return { valid: false, error: 'maxLength' };
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          return { valid: false, error: 'pattern' };
        }
        return { valid: true };
      }
    },
    boolean: {
      type: 'boolean',
      validate: (value) => {
        return { valid: typeof value === 'boolean' };
      }
    },
    array: {
      type: 'array',
      validate: (value, rule) => {
        if (!Array.isArray(value)) {
          return { valid: false, error: 'type' };
        }
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          return { valid: false, error: 'minLength' };
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          return { valid: false, error: 'maxLength' };
        }
        return { valid: true };
      }
    },
    object: {
      type: 'object',
      validate: (value, rule) => {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return { valid: false, error: 'type' };
        }
        if (rule.required) {
          const missingKeys = rule.required.filter(key => !(key in value));
          if (missingKeys.length > 0) {
            return { valid: false, error: 'required', details: missingKeys };
          }
        }
        return { valid: true };
      }
    }
  },

  // 設定の検証
  validate: function(config, validationRules, options = {}) {
    const {
      strict = false,      // 厳格モード（未知のプロパティを拒否）
      applyDefaults = true, // デフォルト値を適用
      removeUnknown = false // 未知のプロパティを削除
    } = options;

    const errors = [];
    const validatedConfig = applyDefaults ? { ...validationRules.defaults } : {};
    const knownProperties = new Set(Object.keys(validationRules.properties || {}));

    // 各プロパティを検証
    for (const [key, rule] of Object.entries(validationRules.properties || {})) {
      const value = config[key];
      const hasValue = config.hasOwnProperty(key);

      // 必須プロパティのチェック
      if (rule.required && !hasValue) {
        errors.push({
          property: key,
          error: 'required',
          message: `${key} is required`
        });
        continue;
      }

      // プロパティが存在しない場合、デフォルト値を使用
      if (!hasValue) {
        if (rule.default !== undefined && applyDefaults) {
          validatedConfig[key] = rule.default;
        }
        continue;
      }

      // 値の検証
      const validationResult = this.validateValue(value, rule);
      if (!validationResult.valid) {
        errors.push({
          property: key,
          error: validationResult.error,
          message: this.getErrorMessage(key, validationResult, rule)
        });
      } else {
        validatedConfig[key] = validationResult.value;
      }
    }

    // 未知のプロパティの処理
    for (const key of Object.keys(config)) {
      if (!knownProperties.has(key)) {
        if (strict) {
          errors.push({
            property: key,
            error: 'unknown',
            message: `${key} is not a recognized property`
          });
        } else if (!removeUnknown) {
          validatedConfig[key] = config[key];
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      config: validatedConfig
    };
  },

  // 単一の値を検証
  validateValue: function(value, rule) {
    // カスタムバリデータの使用
    if (rule.validator) {
      const result = rule.validator(value, rule);
      if (typeof result === 'boolean') {
        return { valid: result, value };
      }
      return result;
    }

    // 型ベースのバリデーション
    const typeRule = this.DEFAULT_RULES[rule.type];
    if (!typeRule) {
      return {
        valid: false,
        error: 'unsupported_type',
        message: `Unsupported validation type: ${rule.type}`
      };
    }

    const result = typeRule.validate(value, rule);
    return {
      valid: result.valid,
      error: result.error,
      value: result.valid ? value : undefined
    };
  },

  // エラーメッセージの生成
  getErrorMessage: function(property, validationResult, rule) {
    const messages = {
      required: `${property} is required`,
      type: `${property} must be of type ${rule.type}`,
      min: `${property} must be at least ${rule.min}`,
      max: `${property} must be at most ${rule.max}`,
      minLength: `${property} must be at least ${rule.minLength} characters long`,
      maxLength: `${property} must be at most ${rule.maxLength} characters long`,
      pattern: `${property} must match the pattern ${rule.pattern}`,
      unknown: `${property} is not a recognized configuration option`
    };

    return messages[validationResult.error] || `${property} is invalid`;
  },

  // バリデーションルールのビルダー
  createRule: function(type, options = {}) {
    return {
      type,
      ...options
    };
  },

  // 数値ルールの作成
  number: function(options = {}) {
    return this.createRule('number', options);
  },

  // 文字列ルールの作成
  string: function(options = {}) {
    return this.createRule('string', options);
  },

  // ブール値ルールの作成
  boolean: function(options = {}) {
    return this.createRule('boolean', options);
  },

  // 配列ルールの作成
  array: function(options = {}) {
    return this.createRule('array', options);
  },

  // オブジェクトルールの作成
  object: function(options = {}) {
    return this.createRule('object', options);
  },

  // 複合ルールの作成
  compose: function(...rules) {
    return {
      type: 'compose',
      validate: (value) => {
        for (const rule of rules) {
          const result = this.validateValue(value, rule);
          if (!result.valid) {
            return result;
          }
        }
        return { valid: true, value };
      }
    };
  },

  // 条件付きルールの作成
  conditional: function(condition, rule) {
    return {
      type: 'conditional',
      validate: (value, allValues) => {
        if (condition(allValues)) {
          return this.validateValue(value, rule);
        }
        return { valid: true, value };
      }
    };
  },

  // 配列項目の検証
  arrayOf: function(itemRule) {
    return {
      type: 'array',
      validate: (value, rule) => {
        const arrayResult = this.DEFAULT_RULES.array.validate(value, rule);
        if (!arrayResult.valid) {
          return arrayResult;
        }

        for (let i = 0; i < value.length; i++) {
          const itemResult = this.validateValue(value[i], itemRule);
          if (!itemResult.valid) {
            return {
              valid: false,
              error: 'item_invalid',
              message: `Item at index ${i} is invalid: ${itemResult.error}`
            };
          }
        }

        return { valid: true, value };
      }
    };
  },

  // オブジェクト形状の検証
  shape: function(properties) {
    return {
      type: 'object',
      validate: (value) => {
        const objectResult = this.DEFAULT_RULES.object.validate(value, {});
        if (!objectResult.valid) {
          return objectResult;
        }

        for (const [key, rule] of Object.entries(properties)) {
          if (value.hasOwnProperty(key)) {
            const result = this.validateValue(value[key], rule);
            if (!result.valid) {
              return {
                valid: false,
                error: 'property_invalid',
                message: `Property ${key} is invalid: ${result.error}`
              };
            }
          }
        }

        return { valid: true, value };
      }
    };
  },

  // ユニオン型（複数の型のいずれか）の検証
  union: function(...rules) {
    return {
      type: 'union',
      validate: (value) => {
        const errors = [];
        for (const rule of rules) {
          const result = this.validateValue(value, rule);
          if (result.valid) {
            return result;
          }
          errors.push(result.error);
        }
        return {
          valid: false,
          error: 'union',
          message: `Value must match one of the allowed types. Got errors: ${errors.join(', ')}`
        };
      }
    };
  },

  // 列挙値の検証
  enum: function(...values) {
    return {
      type: 'enum',
      validate: (value) => {
        if (values.includes(value)) {
          return { valid: true, value };
        }
        return {
          valid: false,
          error: 'enum',
          message: `Value must be one of: ${values.join(', ')}`
        };
      }
    };
  },

  // バリデーションスキーマの作成
  createSchema: function(properties, options = {}) {
    return {
      properties,
      defaults: options.defaults || {},
      ...options
    };
  },

  // スキーマに基づくバリデータの作成
  createValidator: function(schema) {
    return (config, options = {}) => {
      return this.validate(config, schema, options);
    };
  }
};

// グローバルスコープに公開
window.ConfigValidator = ConfigValidator;

// TeaSalesAppに統合
if (window.TeaSalesApp) {
  window.TeaSalesApp.ConfigValidator = ConfigValidator;
}

// ES6モジュールとしてもエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigValidator;
}