package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "tool",
	Short: "Tool is a software that helps us better manage data with the proplus pit2-system",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(`Welcome to use our tool.`)
		fmt.Println(`Use "tool --help" for more information about a command.`)
	},
	CompletionOptions: cobra.CompletionOptions{
		DisableDefaultCmd: true,
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
