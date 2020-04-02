import isString from "lodash/isString"
import isObject from "lodash/isObject"
import isUndefined from "lodash/isUndefined"
import isFunction from "lodash/isFunction"
import keys from "lodash/keys"
import merge from "lodash/merge"

class EvalWizard {
    constructor ( params ) {
        this.params =  {
            itermediate_code: "",
            context: null,
            ...params
        }
        this.cache = {}        
    }

    set_intermediate_code (  intermediate_code) {
        this.cache = {}
        this.params.intermediate_code = intermediate_code
    }


    eval ( ret_code, vars  ) {
        let cached = null;
        let func = null
        let cache_id = null
        let vars_id = null
        let start_date = +new Date()

        if ( isObject( vars ) ) {
            if ( isString( vars.$evalwizard_keys ) ) {
                vars_id = vars.$evalwizard_keys
            } else {
                vars_id = vars.$evalwizard_keys = keys( vars ).join(", ")
            }
        } else {
            vars_id = ""
        }

        cache_id = `${ret_code}@@@${vars_id}`

        if ( false && isFunction( this.cache[ cache_id ] ) ) {
            func = this.cache[ cache_id ]
        } else {
            let code = `
                func = function( { ${ vars_id } } ) {
                    
                    ${ this.params.intermediate_code }
                        return ${ ret_code }
                }
            
            `
            
            eval(code)
            this.cache[ cache_id ] = func
        }
        
        return func.call( this.params.context, vars )
        
    }

    log ( data ) {
        console.log( "%cevalwizard:", "color: red;", data )
    }
}

export default EvalWizard